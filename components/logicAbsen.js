import userShema from "../model/userShema.js";
import fs from "fs";
import dataImage from "../middleware/cloudinary.js";
import timestampFungsi from "../middleware/fungsiTimeStamp.js";

const fungsiCaraUser = async (message) => {
  const cariData = await userShema.find();

  const hasilData = cariData.filter(
    (data) => data.noPhone === +message.from.split("@")[0],
  );

  return hasilData;
};

export const logicAbsen = async (client) => {
  const { tahun, tanggal, bulan, jam, menit, detik } = timestampFungsi();
  let latitudeDataBase;
  let longitudeDataBase;
  let lokasi = false;
  let gambarBoolean = false;
  let lokasiUpload = false;
  let bukangambarUpload = false;

  const autofalse = () => {
    lokasi = false;
    gambarBoolean = false;
    lokasiUpload = false;
    bukangambarUpload = false;
  };
  //   ! Pertama Client Chat
  const tempDir = "temp";
  if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

  client.on("message", async (message) => {
    try {
      const dataPesan = message.body.toLowerCase().trim();

      const hasilData = await fungsiCaraUser(message);

      if (dataPesan !== "absen" && !lokasi && !gambarBoolean) {
        client.sendMessage(
          message.from,
          "Halo ini admin Absenia.\n Jika ingin melakukan absen, silahkan ketik `Absen` ",
        );
      } else if (
        dataPesan === "absen" &&
        hasilData.length === 0 &&
        !lokasi &&
        !gambarBoolean
      ) {
        client.sendMessage(
          message.from,
          "Maaf nomor kamu belum terdaftar, silahkan membuat akun terlebih dahulu ke https://absenia.com/",
        );
      } else if (
        hasilData.length === 1 &&
        !message.location?.latitude &&
        !message.location?.longitude &&
        !lokasiUpload &&
        !lokasi
      ) {
        lokasi = true;

        client.sendMessage(
          message.from,
          `Halo ${hasilData[0].namaUser}, bisa kirim lokasi anda`,
        );
      } else if (
        !message.location?.latitude &&
        !message.location?.longitude &&
        lokasi &&
        !gambarBoolean
      ) {
        client.sendMessage(
          message.from,
          `Halo ${hasilData[0].namaUser}, format yang anda kirim bukan Lokasi, silahkan kirim lokasi`,
        );
      } else if (message.location?.latitude && message.location?.longitude) {
        const latitude = message.location?.latitude?.toString().split("");
        const longitude = message.location?.longitude?.toString().split("");

        const cekLatitude = latitude.slice(0, 6).join("");
        const cekLatitude2 = latitude.slice(6, 7).join("");
        const ceklongitude = longitude.slice(0, 7).join("");
        latitudeDataBase = message.location?.latitude;
        longitudeDataBase = message.location?.longitude;

        if (
          // +cekLatitude === -6.208 &&
          // +ceklongitude === 106.855 &&
          // +cekLatitude2 >= 3 &&
          // +cekLatitude2 <= 5 &&
          !gambarBoolean
        ) {
          client.sendMessage(
            message.from,
            `Terimakasih ${hasilData[0].namaUser}`,
          );
          gambarBoolean = true;
        } else {
          client.sendMessage(
            message.from,
            `Maaf ${hasilData[0].namaUser}, anda bukan dilokasi yang seharusnya, anda tidak bisa melanjutkan absen`,
            autofalse(),
          );
        }
      }

      if (!lokasiUpload && gambarBoolean && lokasi) {
        client.sendMessage(
          message.from,
          `Lokasi Anda Sesuai, Silahkan Upload Foto Selfi Anda`,
        );
        lokasiUpload = true;
      } else if (gambarBoolean && lokasi && message.hasMedia) {
        const mediaData = await message.downloadMedia();
        const fileName = await `temp/${message.timestamp}.${
          mediaData.mimetype.split("/")[1]
        }`;

        fs.writeFileSync(fileName, mediaData.data, {
          encoding: "base64",
        });

        const gambarSelfie = await dataImage.uploader.upload(fileName, {
          folder: "dummy",
        });

        await hasilData[0].absen.dataWaktu.push({
          tanggal: new Date(),
          detailWaktu: {
            tanggalBulanTahun: `${tanggal}-${bulan}-${tahun}`,
            waktu: `${jam}:${menit}:${detik}`,
          },
          lokasi: {
            latitude: latitudeDataBase,
            longitude: longitudeDataBase,
          },
          fotoSelfie: {
            publick_id: gambarSelfie.public_id,
            url: gambarSelfie.secure_url,
          },
        });

        await hasilData[0].save();

        await fs.unlinkSync(fileName);

        client.sendMessage(
          message.from,
          `Terimakasih ${hasilData[0].namaUser}, anda Sudah Melakukan Absen Masuk`,
        );
        autofalse();
      } else if (gambarBoolean && lokasi && !message.hasMedia && lokasiUpload) {
        client.sendMessage(
          message.from,
          `Maaf ${hasilData[0].namaUser}, file yang anda upload bukan gambar, jika selama 1 menit tidak ada upload gambar maka absen dibatalkan`,
        );
        if (!bukangambarUpload) {
          setTimeout(function () {
            console.log("Hello, setelah 6 detik!");

            autofalse();
          }, 10000);
          bukangambarUpload = true;
        }
      }
    } catch (err) {
      console.log(err);
      console.log(`error cak`);
    }
  });

  //   ! Logic Absen Pencarian
  //   client.on("message", async (message) => {
  //     const dataPesan = message.body.toLowerCase().trim();

  //     const cariData = await userShema.find();

  //     const hasilData = cariData.filter(
  //       (data) => data.noPhone === +message.from.split("@")[0]
  //     );

  //     if (dataPesan === "absen" && hasilData.length === 1 && !lokasi) {
  //       client.sendMessage(
  //         message.from,
  //         "Maaf nomor kamu belum terdaftar, silahkan membuat akun terlebih dahulu ke https://absenia.com/"
  //       );

  //       console.log(`kocak`);
  //       console.log(hasilData.length === 1);
  //       if (hasilData.length === 1) {
  //         lokasi = true;
  //         client.sendMessage(
  //           message.from,
  //           `Halo ${hasilData[0].namaUser}, bisa kirim lokasi anda`
  //         );
  //       }
  //     }
  //   });
};
