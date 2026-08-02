
import struct
import json

class FleshEngineAdapter:
    def __init__(self, memory_offset=0x40000000):
        self.memory_offset = memory_offset

    def to_binary(self, compiled_data):
        """
        Packs compiled OCDL data into a binary payload:
        Format: Respiration (float), Fluidity (float), EngineID (int32), NeuralLink (int32)
        """
        resp = float(compiled_data['rt_bio']['resp'])
        fld = float(compiled_data['rt_layout']['fld'])
        eng_id = int(compiled_data['rt_layout']['engine_id'])
        neural = int(compiled_data['rt_bio']['neural'])
        
        # Packing as 2 floats and 2 integers (16 bytes total)
        return struct.pack('ffii', resp, fld, eng_id, neural)

    def get_memory_map(self, payload_size, index=0):
        addr = self.memory_offset + (index * 64) # 64-byte alignment simulation
        return f"MEM_ADDR: {hex(addr)}"
