#!/usr/bin/env python3
"""
Sonic Adventure 2 - GameCube RVZ/ISO extraction and analysis tool.
Read-only validation and structure discovery for reverse-engineering research.
"""

import os
import sys
import json
import hashlib
import struct
from pathlib import Path
from typing import Dict, List, Tuple

class GameCubeISO:
    """Parse GameCube ISO structure and extract metadata."""
    
    # GameCube ISO magic number
    GC_ISO_MAGIC = 0xC2339F3D
    
    def __init__(self, iso_path: str):
        self.iso_path = iso_path
        self.file_size = os.path.getsize(iso_path)
        self.is_rvz = iso_path.lower().endswith('.rvz')
        self.metadata = {}
        
    def validate_header(self) -> bool:
        """Validate GameCube ISO header."""
        try:
            with open(self.iso_path, 'rb') as f:
                # RVZ files need decompression; for now check file existence
                if self.is_rvz:
                    # RVZ is WBFS compressed - would need external tool or library
                    print(f"[INFO] RVZ detected: {self.iso_path}")
                    print(f"[INFO] Size: {self.file_size / (1024**3):.2f} GB")
                    return True
                else:
                    # Try reading ISO header
                    magic = struct.unpack('>I', f.read(4))[0]
                    return magic == self.GC_ISO_MAGIC
        except Exception as e:
            print(f"[ERROR] Failed to validate header: {e}")
            return False
    
    def extract_metadata(self) -> Dict:
        """Extract available metadata from ISO/RVZ."""
        self.metadata = {
            "file_path": self.iso_path,
            "file_size_bytes": self.file_size,
            "file_size_gb": round(self.file_size / (1024**3), 2),
            "format": "RVZ (compressed)" if self.is_rvz else "ISO (raw)",
            "game_id": None,
            "game_title": None,
            "region": None,
            "validated": False
        }
        
        # For RVZ, we need to decompress or use external tools
        if self.is_rvz:
            self.metadata["note"] = "RVZ is WBFS-compressed; use 'wit' or Dolphin to extract ISO"
        
        return self.metadata
    
    def compute_hash(self, algorithm: str = 'sha256') -> str:
        """Compute file hash for validation."""
        hash_obj = hashlib.new(algorithm)
        with open(self.iso_path, 'rb') as f:
            while chunk := f.read(8192):
                hash_obj.update(chunk)
        return hash_obj.hexdigest()

class SonicAdventure2Analyzer:
    """Sonic Adventure 2 specific reverse-engineering tools."""
    
    def __init__(self, iso_path: str):
        self.iso = GameCubeISO(iso_path)
        self.game_name = "Sonic Adventure 2 - Battle (USA)"
        
    def validate_rom(self) -> Dict:
        """Validate ROM integrity and structure."""
        report = {
            "game": self.game_name,
            "timestamp": __import__('datetime').datetime.now().isoformat(),
            "validation_steps": []
        }
        
        # Step 1: Validate file exists and is readable
        if not os.path.exists(self.iso.iso_path):
            report["validation_steps"].append({
                "step": "File existence",
                "status": "FAILED",
                "error": "File not found"
            })
            return report
        
        report["validation_steps"].append({
            "step": "File existence",
            "status": "OK",
            "size_bytes": self.iso.file_size
        })
        
        # Step 2: Validate header
        header_valid = self.iso.validate_header()
        report["validation_steps"].append({
            "step": "Header validation",
            "status": "OK" if header_valid else "WARN",
            "note": "RVZ format detected; requires decompression for full ISO inspection"
        })
        
        # Step 3: Extract metadata
        metadata = self.iso.extract_metadata()
        report["metadata"] = metadata
        
        return report
    
    def generate_inventory(self, output_path: str):
        """Generate structured inventory of ROM contents."""
        inventory = {
            "project": self.game_name,
            "platform": "Nintendo GameCube",
            "processor": "PowerPC",
            "format": "RVZ (WBFS compressed ISO)",
            "rom_path": self.iso.iso_path,
            "file_size_bytes": self.iso.file_size,
            "sha256": self.iso.compute_hash('sha256'),
            "validation": self.validate_rom(),
            "notes": [
                "Original RVZ dump preserved for reference",
                "Do not modify original archive",
                "RVZ extraction requires 'wit' utility or Dolphin",
                "PowerPC architecture supported by Ghidra with SleighDecompiler",
                "Web deployment via Dolphin emulator WebAssembly build"
            ]
        }
        
        with open(output_path, 'w') as f:
            json.dump(inventory, f, indent=2)
        
        print(f"[OK] Inventory written to: {output_path}")
        return inventory


def main():
    if len(sys.argv) < 2:
        print("Usage: python3 inspect_gamecube.py <rom_path>")
        print("Example: python3 inspect_gamecube.py ROMS/Sonic\\ Adventure\\ 2.rvz")
        sys.exit(1)
    
    rom_path = sys.argv[1]
    
    print(f"[*] Analyzing: {rom_path}")
    analyzer = SonicAdventure2Analyzer(rom_path)
    
    # Validate ROM
    validation = analyzer.validate_rom()
    print(json.dumps(validation, indent=2))
    
    # Generate inventory
    inventory_path = os.path.join(os.path.dirname(rom_path), '..', 'inventory.json')
    analyzer.generate_inventory(inventory_path)


if __name__ == '__main__':
    main()
