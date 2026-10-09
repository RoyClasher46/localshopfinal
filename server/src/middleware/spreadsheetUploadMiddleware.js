import multer from "multer";

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedMimes = [
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // xlsx
    "application/vnd.ms-excel", // xls
    "text/csv", // csv
    "application/csv",
    "text/plain",
    "application/octet-stream", // some browsers send this for xlsx/csv
  ];

  const lowerName = file.originalname.toLowerCase();
  const isValidExt =
    lowerName.endsWith(".xlsx") ||
    lowerName.endsWith(".xls") ||
    lowerName.endsWith(".csv");

  if (isValidExt || allowedMimes.includes(file.mimetype)) {
    return cb(null, true);
  }

  return cb(
    new Error(
      "Only Excel (.xlsx, .xls) and CSV (.csv) spreadsheets are supported.",
    ),
    false,
  );
};

const spreadsheetUpload = multer({
  storage,
  limits: {
    fileSize: 15 * 1024 * 1024, // 15MB limit
  },
  fileFilter,
});

export default spreadsheetUpload;
