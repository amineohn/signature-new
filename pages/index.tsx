import type { NextPage } from "next";
import React, { useEffect, useState } from "react";
import FadeIn from "react-fade-in";
import axios from "axios";
import { UiFileInputButton } from "../components/uiFileButton";
import { Uploads } from "../libs/types";
import { Firebase } from "../libs/firebase";
const Home: NextPage = () => {
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [file, setFile] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([{}] as any);
  const fire = new Firebase();
  const deleted = async (id: string) => {
    try {
      await fire.delete(id, "photos");
      setData(data.filter((item) => item.id !== id));
    } catch (error) {
      console.log(error);
    }
  };
  const onChange = async (formData) => {
    const config = {
      headers: { "content-type": "multipart/form-data" },
      onUploadProgress: (event) => {
        console.log(
          `Current progress:`,
          Math.round((event.loaded * 100) / event.total)
        );
      },
    };
    setLoading(true);
    const response = await axios.post("/api/uploads", formData, config);
    if (response.data !== "success") {
      setSuccess("Uploaded successfully");
      setFile(response.data.files[0].filename);
      try {
        await fire.collection("photos").add({
          file: response.data.files[0].filename,
          filename: response.data.files[0].originalname,
          path: response.data.files[0].path,
          destionation: response.data.files[0].destination,
          mimetype: response.data.files[0].mimetype,
          createdAt: new Date(),
          size: response.data.files[0].size,
          encoding: response.data.files[0].encoding,
        });
        setSuccess("Uploaded successfully");
        setError("");
        return;
      } catch (err) {
        console.error(err);
        setError("Une erreur est survenue");
      }
      setLoading(false);
    } else {
      setError("Error uploading");
      setLoading(false);
    }

    console.log(response);
  };
  useEffect(() => {
    fire.collection("photos").onSnapshot((snapshot) => {
      snapshot.forEach((doc) => {
        const data = doc.data();
        const id = doc.id;
        const filename = data.file;

        setData((prev) => [
          ...prev,
          {
            id,
            filename,
          },
        ]);
      });
    });

    if (data.length != 0) {
      setData(data.reverse());
      setLoading(false);
    }

    if (data.length === 0) {
      setLoading(true);
    }
  }, []);
  return (
    <>
      <FadeIn>
        <div className="flex flex-col items-center justify-center h-screen">
          <div className="rounded-lg px-8 pt-6 pb-8 mb-4 space-y-2">
            {success && (
              <FadeIn>
                <div className="bg-green-500 text-white p-4 rounded-lg">
                  {success}
                </div>
              </FadeIn>
            )}
            {loading && (
              <FadeIn>
                <div className="bg-blue-500 text-white p-4 rounded-lg">
                  Uploading...
                </div>
              </FadeIn>
            )}
            {file && (
              <FadeIn>
                <div className="text-white p-4 rounded-lg flex justify-center">
                  <img
                    src={`http://localhost:3000/static/images/uploads/${file}`}
                    className="w-36 h-36 rounded-lg"
                    alt="uploaded"
                  />
                </div>
              </FadeIn>
            )}
            {error && (
              <FadeIn>
                <div className="bg-red-500 text-white p-4 rounded-lg">
                  {error}
                </div>
              </FadeIn>
            )}
            <div className="flex flex-col items-center justify-center">
              <h1 className="text-center text-2xl font-bold text-gray-800">
                Upload
              </h1>
              <p className="text-center text-gray-600">
                Upload a single file or multiple files.
              </p>
            </div>
            <div className="flex flex-col items-center justify-center">
              <UiFileInputButton
                label="Upload"
                uploadFileName="theFiles"
                allowMultipleFiles={true}
                className="max-w-xs py-2 px-4 flex justify-center items-center bg-greenDDTV hover:bg-green-800 focus:ring-green-800 focus:ring-offset-green-100 text-white w-full transition ease-in duration-200 text-center text-base font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 rounded-lg"
                onChange={onChange}
              />
            </div>
            {data !== null ? (
              data.map((file: Uploads) => (
                <div className="inline-flex">
                  <div className="grid grid-cols-1 items-center justify-center space-y-4">
                    <div className="">
                      {file.filename && (
                        <div className="space-y-2">
                          <img
                            key={file.id}
                            src={`http://localhost:3000/static/images/uploads/${file.filename}`}
                            className="w-36 h-36 rounded-lg"
                            alt="uploaded"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center">
                <div className="text-center text-gray-600">
                  No files uploaded yet
                </div>
              </div>
            )}
          </div>
        </div>
      </FadeIn>
    </>
  );
};
export default Home;
