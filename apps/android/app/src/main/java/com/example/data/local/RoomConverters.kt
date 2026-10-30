package com.example.data.local

import androidx.room.TypeConverter
import com.example.model.SourceType
import org.json.JSONArray

class RoomConverters {

    @TypeConverter
    fun fromStringList(value: List<String>?): String {
        if (value.isNullOrEmpty()) return "[]"
        val array = JSONArray()
        value.forEach { array.put(it) }
        return array.toString()
    }

    @TypeConverter
    fun toStringList(value: String?): List<String> {
        if (value.isNullOrBlank() || value == "[]") return emptyList()
        return try {
            val array = JSONArray(value)
            val list = mutableListOf<String>()
            for (i in 0 until array.length()) {
                list.add(array.getString(i))
            }
            list
        } catch (e: Exception) {
            emptyList()
        }
    }

    @TypeConverter
    fun fromSourceType(type: SourceType?): String {
        return type?.name ?: SourceType.OFFICIAL_GUIDE.name
    }

    @TypeConverter
    fun toSourceType(value: String?): SourceType {
        return try {
            if (value != null) SourceType.valueOf(value) else SourceType.OFFICIAL_GUIDE
        } catch (e: Exception) {
            SourceType.OFFICIAL_GUIDE
        }
    }
}
