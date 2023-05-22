const timestampFungsi = () => {
  const sekarang = new Date();
  const tahun = sekarang.getFullYear();
  const bulan = sekarang.getMonth() + 1; // Perlu ditambah 1 karena indeks bulan dimulai dari 0
  const tanggal = sekarang.getDate();
  const jam = sekarang.getHours();
  const menit = sekarang.getMinutes();
  const detik = sekarang.getSeconds();

  return {
    tahun,
    tanggal,
    bulan,
    jam,
    menit,
    detik,
  };
};

export default timestampFungsi;
