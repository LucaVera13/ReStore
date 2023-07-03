"use client";
import React, { useState, useEffect } from "react";
import { Form, Input, Button, Select, DatePicker, Upload } from "antd";
import axios from "axios";
import { useSession } from "next-auth/react";
import { Navbar } from "../components/navbar/navbar";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Swal from "sweetalert2";

function usuario({ searchParams }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [cookieValue, setCookieValue] = useState(null);
  const [readOnly, setReadOnly] = useState(true);
  const [cookieImg, setCookieImg] = useState(null);
  const [file, setFile] = useState("");
  const [input, setInput] = useState({
    nombre: "",
    apellido: "",
    email: "",
    fechaNacimiento: "",
    genero: "",
  });
  const [newInput, setNewInput] = useState({
    nombre: "",
    apellido: "",
    email: "",
    fechaNacimiento: "",
    genero: "",
  });

  const [comprados, setComprados] = useState([]);
  const [calificado, setCalificado] = useState([]);
  // const [detalle, setDetalle]= useState(null)

  useEffect(() => {
    setCookieValue(
      document.cookie
        .split("; ")
        .find((row) => row.startsWith("User_id"))
        ?.split("=")[1]
    );
  }, []);

  useEffect(() => {
    if (!session && !document.cookie.includes("User_id")) {
      router.push("/home");
    }
  }, []);

  const handleSubmit = () => {
    const formData = new FormData();

    for (const key in newInput) {
      if (newInput[key] === "" || newInput[key] === "undefined") continue;
      else formData.append(key, newInput[key]);
    }
    if (file) formData.append("profileImage", file);
    const id = session ? session.user.id : cookieValue;
    console.log([...formData]);
    axios
      .put(`https://re-store.onrender.com/users/${id}`, formData)
      .then(() => {
        Swal.fire({
          icon: "success",
          title: "Cambios guardados exitosamente",
        });
      })
      .then(() => {
        handleToggleReadOnly();
      })
      .catch((error) => {
        Swal.fire({
          icon: "error",
          title: "Algo ha salido mal, intentalo nuevamente mas tarde",
        });
      });
  };

  // useEffect(() => {
  //   const fetchDetail = async (id) => {
  //     const response = await fetch(
  //       `https://re-store.onrender.com/categories/technology/Detail/${id}`
  //     );
  //     const product = await response.json();
  //     setDetalle(product);
  //   };
  //   comprados.forEach((order) => {
  //     order.orderItems.forEach((producto) => {
  //       if (!producto.calificado) {
  //         fetchDetail(producto.id);
  //       }
  //     });
  //   });
  // }, [comprados]);

  useEffect(() => {
    const fetchUsuario = async (id) => {
      const response = await fetch(`https://re-store.onrender.com/users/${id}`);
      const user = await response.json();

      setInput({
        email: user.email,
        nombre: user.nombre,
        apellido: user.apellido,
        genero: user.genero,
        fechaNacimiento: user.fechaNacimiento,
      });
      cookieValue && setCookieImg(user.imagenDePerfil);

      if (user.orders) {
        const productosComprados = user.orders.filter((order) =>
          order.orderItems.map((item) => item.calificado === false)
        );
        setComprados(productosComprados);

        const productoCalificado = user.orders.filter((order) =>
          order.orderItems.map((item) => item.calificado === true)
        );
        setCalificado(productoCalificado);
      }
    };

    if (session) {
      fetchUsuario(session.user.id);
    } else fetchUsuario(cookieValue);
  }, [cookieValue]);

  const handleToggleReadOnly = () => {
    setReadOnly(!readOnly);
  };

  const handleSelectChange = (value, clave) => {
    setNewInput((prevInput) => ({
      ...prevInput,
      [clave]: value,
    }));
  };

  // const handleButtonRating = (productId) => {
  //   router.push(`/user/${session.user.id}/ratingProduct/${productId}`);
  //   // router.push({pathname:`/user/${session.user.id}/ratingProduct/${productId}`})
  // };

  const handleCancelButton = () => {
    setNewInput(Input);
    handleToggleReadOnly();
    setNewInput(input);
  };
  return (
    <>
      <Navbar></Navbar>
      <div className="container mx-auto p-4">
        <Button onClick={readOnly ? handleToggleReadOnly : handleCancelButton}>
          {readOnly ? "Editar perfil" : "Cancelar"}
        </Button>
        <Link href={"/user/ubicacion"}>
          <Button>Editar Ubicaciones</Button>
        </Link>
        <Form
          onFinish={handleSubmit}
          labelCol={{ span: 0 }}
          wrapperCol={{ span: 14 }}
        >
          <Form.Item label="Imagen" valuePropName="file">
            <Upload
              disabled={session ? true : false}
              listType="picture-card"
              showUploadList={false}
              customRequest={({ file }) => {
                setFile(file);
                handleToggleReadOnly();
              }}
            >
              {file ? (
                <img
                  src={URL.createObjectURL(file)}
                  alt="Preview"
                  style={{ width: "100%" }}
                />
              ) : (
                <img
                  src={
                    (session && session.user.image) ||
                    (cookieValue && cookieImg)
                  }
                  alt="Preview"
                  style={{ width: "100%" }}
                />
              )}
            </Upload>
          </Form.Item>
          {Object.entries(input).map(([clave, valor]) => (
            <Form.Item key={clave} label={clave}>
              {clave === "genero" ? (
                <Select
                  onChange={(value) => handleSelectChange(value, clave)}
                  value={newInput.genero ? newInput.genero : input.genero}
                  disabled={readOnly}
                  className="w-full"
                >
                  <Select.Option value="masculino">Masculino</Select.Option>
                  <Select.Option value="femenino">Femenino</Select.Option>
                  <Select.Option value="otro">Otro</Select.Option>
                </Select>
              ) : clave === "fechaNacimiento" ? (
                <DatePicker
                  onChange={(value) => handleSelectChange(value, clave)}
                  value={newInput.fechaNacimiento}
                  disabled={readOnly}
                  className="w-full"
                />
              ) : (
                <Input
                  disabled={clave === "email" ? true : false}
                  readOnly={readOnly}
                  placeholder={valor}
                  className="w-full border rounded px-3 py-2"
                  onChange={(event) =>
                    handleSelectChange(event.target.value, clave)
                  }
                />
              )}
            </Form.Item>
          ))}
        </Form>
        {!readOnly && (
          <Button onClick={handleSubmit} htmlType="submit">
            Guardar Cambios
          </Button>
        )}
        <div>
          {comprados.length > 0 && (
            <div>
              <h2 className="text-2xl font-semibold mb-4">Tus productos</h2>
              <ul>
                {comprados.map((order) =>
                  order.orderItems.map((producto) => (
                    <li
                      key={producto.id}
                      className="flex justify-between items-center"
                    >
                      <span>{producto.id}</span>{" "}
                      {producto.calificado ? (
                        <span className="text-green-500">
                          Producto ya calificado
                        </span>
                      ) : (
                        <div>
                          <span> </span>
                          <Link
                            href={{
                              pathname: "/ratingProduct/",
                              query: {
                                product: producto.id,
                                user: session ? session.user.id : cookieValue,
                              },
                            }}
                          >
                            <button className="bg-blue-500 hover:bg-blue-600 text-white font-bold px-4 rounded">
                              Calificar
                            </button>
                          </Link>
                        </div>
                      )}
                    </li>
                  ))
                )}
              </ul>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default usuario;
