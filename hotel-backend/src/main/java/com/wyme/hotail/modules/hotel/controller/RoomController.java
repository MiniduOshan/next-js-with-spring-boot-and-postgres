package com.wyme.hotail.modules.hotel.controller;

import com.wyme.hotail.modules.hotel.entity.Room;
import com.wyme.hotail.modules.hotel.service.HotelService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/rooms")
public class RoomController {

    private final HotelService hotelService;

    public RoomController(HotelService hotelService) {
        this.hotelService = hotelService;
    }

    @GetMapping
    public ResponseEntity<List<Room>> getRooms(
            @RequestHeader(value = "x-hotel-id", required = false) String hotelId,
            @RequestHeader(value = "x-owner-email", required = false) String owner) {
        return ResponseEntity.ok(hotelService.getRooms(hotelId, owner));
    }

    @PostMapping
    public ResponseEntity<Room> createRoom(
            @RequestHeader(value = "x-hotel-id", required = false) String hotelId,
            @RequestHeader(value = "x-owner-email", required = false) String owner,
            @RequestBody Room room) {
        room.setHotelId(hotelId != null ? hotelId : "");
        room.setOwner(owner != null ? owner : "");
        return ResponseEntity.status(HttpStatus.CREATED).body(hotelService.saveRoom(room));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Room> updateRoom(
            @PathVariable("id") UUID id,
            @RequestHeader(value = "x-hotel-id", required = false) String hotelId,
            @RequestBody Room room) {
        if (hotelId != null) {
            room.setHotelId(hotelId);
        }
        return ResponseEntity.ok(hotelService.updateRoom(id, room));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteRoom(@PathVariable("id") UUID id) {
        hotelService.deleteRoom(id);
        return ResponseEntity.ok(Map.of("success", true));
    }
}
