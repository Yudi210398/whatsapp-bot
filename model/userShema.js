import mongoose from "mongoose";
const Schema = mongoose.Schema;

const dataPersonAbsenia = new Schema({
  namaUser: { type: String, required: true },
  noPhone: { type: Number, required: true, unique: true },
  absen: {
    dataWaktu: [
      {
        tanggal: Date,
        detailWaktu: {
          tanggalBulanTahun: { type: String, required: true },
          waktu: { type: String, required: true },
        },
        lokasi: {
          latitude: Number,
          longitude: Number,
        },
        fotoSelfie: {
          publick_id: { type: String, required: true },
          url: { type: String, required: true },
        },
      },
    ],
  },
});

export default mongoose.model("DataAbsenia", dataPersonAbsenia);
