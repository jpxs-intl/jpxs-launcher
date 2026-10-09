//! Repoints the Sub Rosa game executables at the JPXS masterserver.
//!
//! The game stores the masterserver hostname as a fixed-size, null-padded
//! string. On the Windows builds it has room for the new host; on the Linux
//! (ELF) builds it does not, so we append the new host string to the end of the
//! binary, grow the last PT_LOAD segment to map it, and retarget the single
//! rip-relative `lea` that feeds `gethostbyname`.
//!
//! The set of hostnames to replace (and the replacement) is fetched at runtime
//! from the assets server so it can change without shipping a new launcher.

use crate::error::Error;
use serde::Deserialize;
use std::path::Path;

const MANIFEST_URL: &str = "https://assets.burningcoals.dev/launcher/patches/masterserver.json";
const FALLBACK_HOST: &str = "ms.burningcoals.dev";
const FALLBACK_KNOWN: &[&str] = &["ms.jpxs.io", "www.crypticsea.com"];

#[derive(Deserialize, Default)]
struct Manifest {
    host: Option<String>,
    #[serde(default)]
    known: Vec<String>,
}

async fn fetch_manifest() -> Manifest {
    match reqwest::get(MANIFEST_URL).await {
        Ok(resp) => resp.json::<Manifest>().await.unwrap_or_else(|e| {
            eprintln!("[patch] could not parse masterserver manifest: {e}");
            Manifest::default()
        }),
        Err(e) => {
            eprintln!("[patch] could not fetch masterserver manifest: {e}");
            Manifest::default()
        }
    }
}

/// Patch the game executables inside an installed instance directory.
pub async fn patch_instance(dir: &Path) -> Result<(), Error> {
    let manifest = fetch_manifest().await;
    let host = manifest.host.unwrap_or_else(|| FALLBACK_HOST.to_string());
    let mut known = manifest.known;
    for k in FALLBACK_KNOWN {
        if !known.iter().any(|x| x == k) {
            known.push((*k).to_string());
        }
    }

    let names: &[&str] = if cfg!(target_os = "windows") {
        &["subrosa.exe", "subrosadedicated.exe"]
    } else {
        &["subrosa.x64", "subrosadedicated.x64"]
    };

    for name in names {
        let path = dir.join(name);
        if !path.exists() {
            continue;
        }
        let mut data = std::fs::read(&path)?;
        let count = patch_bytes(&mut data, host.as_bytes(), &known);
        if count > 0 {
            std::fs::write(&path, &data)?;
            println!("[patch] {name}: repointed {count} masterserver reference(s) to {host}");
        }
    }
    Ok(())
}

// --- pure byte patch helpers -------------------------------------------------

fn find_from(hay: &[u8], needle: &[u8], from: usize) -> Option<usize> {
    if from >= hay.len() || needle.is_empty() {
        return None;
    }
    hay[from..]
        .windows(needle.len())
        .position(|w| w == needle)
        .map(|p| p + from)
}

fn count_nulls(d: &[u8], mut i: usize) -> usize {
    let start = i;
    while i < d.len() && d[i] == 0 {
        i += 1;
    }
    i - start
}

fn rd_u16(d: &[u8], o: usize) -> u16 {
    u16::from_le_bytes(d[o..o + 2].try_into().unwrap())
}
fn rd_u32(d: &[u8], o: usize) -> u32 {
    u32::from_le_bytes(d[o..o + 4].try_into().unwrap())
}
fn rd_u64(d: &[u8], o: usize) -> u64 {
    u64::from_le_bytes(d[o..o + 8].try_into().unwrap())
}
fn rd_i32(d: &[u8], o: usize) -> i32 {
    i32::from_le_bytes(d[o..o + 4].try_into().unwrap())
}

fn is_elf(d: &[u8]) -> bool {
    d.starts_with(b"\x7fELF")
}

/// The last PT_LOAD segment: (program-header offset, file offset, virtual address).
fn elf_last_load(d: &[u8]) -> Option<(usize, u64, u64)> {
    let phoff = rd_u64(d, 0x20) as usize;
    let phentsize = rd_u16(d, 0x36) as usize;
    let phnum = rd_u16(d, 0x38) as usize;
    let mut best: Option<(usize, u64, u64)> = None;
    for i in 0..phnum {
        let o = phoff + i * phentsize;
        if o + 0x38 > d.len() {
            break;
        }
        if rd_u32(d, o) == 1 {
            let off = rd_u64(d, o + 8);
            let va = rd_u64(d, o + 16);
            if best.map_or(true, |(_, bo, _)| off > bo) {
                best = Some((o, off, va));
            }
        }
    }
    best
}

/// Offsets of `lea reg, [rip + disp]` instructions that resolve to `target`.
fn find_lea_refs(d: &[u8], target: usize) -> Vec<usize> {
    const MODRM: [u8; 8] = [0x05, 0x0d, 0x15, 0x1d, 0x25, 0x2d, 0x35, 0x3d];
    let mut refs = Vec::new();
    if d.len() < 7 {
        return refs;
    }
    for i in 0..=d.len() - 7 {
        if (d[i] == 0x48 || d[i] == 0x4c) && d[i + 1] == 0x8d && MODRM.contains(&d[i + 2]) {
            let disp = rd_i32(d, i + 3);
            if i as i64 + 7 + disp as i64 == target as i64 {
                refs.push(i);
            }
        }
    }
    refs
}

/// Is the occurrence part of an HTTP header template (i.e. followed by "Host:")?
fn prefix_len(data: &[u8], occ: usize) -> usize {
    if occ >= 5 && &data[occ - 5..occ] == b"Host:" {
        5
    } else {
        0
    }
}

/// Move the enclosing C-string to free space at EOF and retarget its `lea`(s).
fn relocate(
    data: &mut Vec<u8>,
    occ: usize,
    cand_len: usize,
    crlf: usize,
    host: &[u8],
) -> Result<(), String> {
    let str_start = occ - prefix_len(data, occ);
    let after = occ + cand_len;
    let mut newstr = Vec::new();
    newstr.extend_from_slice(&data[str_start..occ]); // "Host:" prefix, if any
    newstr.extend_from_slice(host);
    newstr.extend_from_slice(&data[after..after + crlf]); // trailing CRLFs, if any

    while data.len() % 16 != 0 {
        data.push(0);
    }
    let new_off = data.len();
    data.extend_from_slice(&newstr);
    data.push(0);

    let (pho, seg_off, seg_va) = elf_last_load(data).ok_or("no PT_LOAD segment")?;
    let new_fsz = (new_off as u64 - seg_off) + newstr.len() as u64 + 1;
    data[pho + 0x20..pho + 0x28].copy_from_slice(&new_fsz.to_le_bytes());
    let old_msz = rd_u64(data, pho + 0x28);
    data[pho + 0x28..pho + 0x30].copy_from_slice(&old_msz.max(new_fsz).to_le_bytes());

    let va_new = seg_va + (new_off as u64 - seg_off);
    let refs = find_lea_refs(data, str_start);
    if refs.is_empty() {
        return Err(format!("no lea reference to {str_start:#x}"));
    }
    for r in refs {
        let disp = (va_new as i64 - (r as i64 + 7)) as i32;
        data[r + 3..r + 7].copy_from_slice(&disp.to_le_bytes());
    }
    for k in str_start..after + crlf {
        data[k] = 0;
    }
    Ok(())
}

/// Replace `known` host strings with `host`. Returns the number of references patched.
pub fn patch_bytes(data: &mut Vec<u8>, host: &[u8], known: &[String]) -> usize {
    let mut candidates: Vec<Vec<u8>> = known.iter().map(|s| s.as_bytes().to_vec()).collect();
    candidates.sort_by(|a, b| b.len().cmp(&a.len()));

    let mut occurrences: Vec<(usize, Vec<u8>)> = Vec::new();
    for cand in &candidates {
        let mut start = 0;
        while let Some(occ) = find_from(data, cand, start) {
            start = occ + 1;
            let overlaps = occurrences
                .iter()
                .any(|(o, c)| occ < o + c.len() && occ + cand.len() > *o);
            if !overlaps {
                occurrences.push((occ, cand.clone()));
            }
        }
    }
    occurrences.sort_by_key(|(o, _)| *o);

    let mut count = 0;
    for (occ, cand) in occurrences {
        let after = occ + cand.len();
        let mut crlf = 0;
        while after + crlf + 2 <= data.len() && &data[after + crlf..after + crlf + 2] == b"\r\n" {
            crlf += 2;
        }
        let mut replacement = host.to_vec();
        replacement.extend_from_slice(&data[after..after + crlf]);
        let total = cand.len() + crlf + count_nulls(data, after + crlf);
        // need room for the new string plus at least one null terminator
        if replacement.len() < total {
            data[occ..occ + replacement.len()].copy_from_slice(&replacement);
            for k in occ + replacement.len()..occ + total {
                data[k] = 0;
            }
            count += 1;
        } else if prefix_len(data, occ) == 0 && is_elf(data) {
            if relocate(data, occ, cand.len(), crlf, host).is_ok() {
                count += 1;
            }
        }
    }
    count
}
