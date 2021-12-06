import nextConnect from "next-connect";
import multer from "multer";

const upload = multer({
  storage: multer.diskStorage({
    destination: "./public/static/images/uploads",
    filename: (req, file, cb) => cb(null, file.originalname),
  }),
});

export const router = nextConnect({
  onError(error, req: any, res: any) {
    res
      .status(501)
      .json({ error: `Sorry something Happened! ${error.message}` });
  },
  onNoMatch(req, res) {
    res.status(405).json({ error: `Method '${req.method}' Not Allowed` });
  },
});

router.use(upload.array("theFiles"));

router.post((req, res) => {
  res.status(200).json({ data: "success", files: req.files, file: req.file });
});
export const config = {
  api: {
    bodyParser: false,
  },
};
