import { useState, useEffect } from "react";
import axios from "axios";
import "./styles.css";
import DeleteIcon from "@mui/icons-material/Delete";
import EditSquareIcon from "@mui/icons-material/EditSquare";
import Select from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import ImageIcon from "@mui/icons-material/Image";
import CloseIcon from "@mui/icons-material/Close";
import {
  Grid,
  Card,
  CardActionArea,
  CardMedia,
  CardContent,
  Radio,
  Typography,
} from "@mui/material";
import IconButton from "@mui/material/IconButton";
import CircularProgress from "@mui/material/CircularProgress";
import SendIcon from "@mui/icons-material/Send";
import ImageRadioSelector from './imageRadioSelector';

export default function AutomatizacionesSTOLForm() {
  const [automatizaciones, setAutomatizaciones] = useState([]);
  const [formData, setFormData] = useState({
    nombre_producto: "",
    descripcion: "",
    id_categoria: "",
    cantidad: 0,
    precio_unitario: 0,
    logo_empresa: "",
    imagen: "",
    proveedor: "",
    fecha_ingreso: "",
    codigo_barras: "",
    estado: "Oferta",
    template: "", // Nuevo campo para el template
  });

  // Opciones para los templates
  const templateOptions = [
    {
      id: "basico",
      label: "Básico",
      image: "https://m.media-amazon.com/images/I/611Z8E4usUL._AC_UL480_FMwebp_QL65_.jpg?text=Template+Basico",
    },
    {
      id: "avanzado",
      label: "Avanzado",
      image: "https://m.media-amazon.com/images/I/61YrDwqkEtL._AC_UL480_FMwebp_QL65_.jpg",
    },
    {
      id: "premium",
      label: "Premium",
      image: "https://m.media-amazon.com/images/I/71bCyrY3jCL._AC_UL480_FMwebp_QL65_.jpg",
    },
  ];

  const [selectedDate, setSelectedDate] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState("");
  const [categorias, setCategorias] = useState([]);
  const [fileLogoEmpresa, setFileLogoEmpresa] = useState(null);
  const [fileImagen, setFileImagen] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [fileUrls, setFileUrls] = useState({
    logo_empresa: "",
    imagen: "",
  });
  const [loadingUrls, setLoadingUrls] = useState(false);
  const [currentAutomatizacion, setCurrentAutomatizacion] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [currentFileView, setCurrentFileView] = useState({
    type: null,
    url: "",
    fileName: "",
  });

  const API_BASE_URL =
    "https://theoriginallab-automatizacionestol-back.m0oqwu.easypanel.host";
  const API_KEY = "lety";
  const tableName = "automatizaciones";
  const CORS_ANYWHERE_URL = "https://cors-anywhere.herokuapp.com/";

  const filteredItems = automatizaciones.filter(
    (item) =>
      item.nombre_producto?.toLowerCase().includes(busqueda.toLowerCase()) ||
      item.descripcion?.toLowerCase().includes(busqueda.toLowerCase()) ||
      categorias
        .find((cat) => cat.id_categoria === item.id_categoria)
        ?.categoria?.toLowerCase()
        .includes(busqueda.toLowerCase()) ||
      item.proveedor?.toLowerCase().includes(busqueda.toLowerCase()) ||
      item.codigo_barras?.toLowerCase().includes(busqueda.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [busqueda]);

  const getFileType = (fileName) => {
    if (!fileName) return "other";

    const lowerFileName = fileName.toLowerCase();

    if (lowerFileName.endsWith(".pdf")) {
      return "pdf";
    } else if (/\.(jpe?g|png|gif|bmp|svg)$/i.test(lowerFileName)) {
      return "image";
    } else {
      return "other";
    }
  };

  const handleOpenModal = async (automatizacion) => {
    setCurrentAutomatizacion(automatizacion);
    setOpenModal(true);
    setLoadingUrls(true);
    setError(null);
    setFileUrls({ logo_empresa: "", imagen: "" });
    setCurrentFileView({ type: null, url: "", fileName: "" });

    try {
      if (automatizacion.logo_empresa) {
        const logoEmpresaRequestBody = {
          fileName: automatizacion.logo_empresa,
        };
        const getResponse = await axios.post(
          `${CORS_ANYWHERE_URL}https://kneib5mp53.execute-api.us-west-2.amazonaws.com/dev/getObject`,
          logoEmpresaRequestBody,
          {
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            timeout: 10000,
          }
        );

        if (getResponse.data?.url) {
          setFileUrls((prev) => ({
            ...prev,
            logo_empresa: getResponse.data.url || "",
          }));
        }
      }

      if (automatizacion.imagen) {
        const imagenRequestBody = { fileName: automatizacion.imagen };
        const postResponse = await axios.post(
          `${CORS_ANYWHERE_URL}https://kneib5mp53.execute-api.us-west-2.amazonaws.com/dev/getObject`,
          imagenRequestBody,
          {
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            timeout: 10000,
          }
        );

        if (postResponse.data?.url) {
          setFileUrls((prev) => ({
            ...prev,
            imagen: postResponse.data.url || "",
          }));
        }
      }
    } catch (error) {
      console.error("Error al obtener URLs:", error);
      let errorMessage = "No se pudo obtener los archivos. Intenta más tarde";

      if (axios.isAxiosError(error)) {
        console.error("Error Axios:", error.message, error.response?.data);
        if (error.code === "ERR_NETWORK") {
          errorMessage = "Error de conexión. Verifica tu internet";
        } else if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      setError(errorMessage);
    } finally {
      setLoadingUrls(false);
    }
  };

  const handleViewFile = (type, url, fileName) => {
    setCurrentFileView({ type, url, fileName });
  };

  const handleCloseFileView = () => {
    setCurrentFileView({ type: null, url: "", fileName: "" });
  };

  const uploadFile = async (file, fileNameKey) => {
    const filename = file.name;

    try {
      const fileArrayBuffer = await file.arrayBuffer();
      const fileBlob = new Blob([fileArrayBuffer], { type: file.type });

      const response = await axios.put(
        `${CORS_ANYWHERE_URL}https://kneib5mp53.execute-api.us-west-2.amazonaws.com/dev/folder/bucket-rodval/${filename}`,
        fileBlob,
        {
          headers: {
            "Content-Type": file.type,
          },
        }
      );

      return { success: response.data?.success || false };
    } catch (error) {
      console.error(`Error al subir archivo ${fileNameKey}:`, error);
      throw new Error(`Error al subir el archivo ${fileNameKey}: ${file.name}`);
    }
  };

  useEffect(() => {
    fetchAutomatizaciones();
    fetchCategorias();
  }, []);

  const resetForm = () => {
    setFormData({
      nombre_producto: "",
      descripcion: "",
      id_categoria: "",
      cantidad: 0,
      precio_unitario: 0,
      logo_empresa: "",
      imagen: "",
      proveedor: "",
      fecha_ingreso: "",
      codigo_barras: "",
      estado: "Oferta",
      template: "",
    });
    setSelectedDate(null);
    setFileLogoEmpresa(null);
    setFileImagen(null);
    setIsEditing(false);
    setError(null);
  };

  const fetchAutomatizaciones = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/${tableName}/all`, {
        headers: {
          "Content-Type": "application/json",
          apikey: API_KEY,
        },
        timeout: 30000,
      });

      const itemsWithId = response.data.records.map((item) => ({
        id_automatizaciones: item.id_automatizaciones || 0,
        nombre_producto: item.nombre_producto || "",
        descripcion: item.descripcion || "",
        id_categoria: item.id_categoria || "",
        cantidad: item.cantidad || 0,
        precio_unitario: item.precio_unitario || 0,
        logo_empresa: item.logo_empresa || "",
        imagen: item.imagen || "",
        proveedor: item.proveedor || "",
        fecha_ingreso: item.fecha_ingreso || "",
        codigo_barras: item.codigo_barras || "",
        estado: item.estado || "Oferta",
        template: item.template || "",
      }));

      setAutomatizaciones(itemsWithId);
    } catch (err) {
      setError("Error al cargar los datos de automatizaciones TOL");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategorias = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/categorias/all`, {
        headers: {
          "Content-Type": "application/json",
          apikey: API_KEY,
        },
        timeout: 30000,
      });

      setCategorias(response.data.records);
    } catch (err) {
      console.error("Error al cargar categorías:", err);
      setCategorias([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const fechaFormateada = selectedDate?.toISOString().split("T")[0] || "";

      const updatedFormData = { ...formData, fecha_ingreso: fechaFormateada };

      if (fileLogoEmpresa) {
        const uploadResult = await uploadFile(
          fileLogoEmpresa,
          "logo_empresa"
        ).catch((error) => {
          throw new Error(
            `Fallo subida Logo Empresa: ${
              error instanceof Error ? error.message : "Error desconocido"
            }`
          );
        });
        if (uploadResult.success) {
          updatedFormData.logo_empresa = fileLogoEmpresa.name;
        }
      } else {
        if (formData.logo_empresa !== undefined) {
          updatedFormData.logo_empresa = formData.logo_empresa;
        }
      }

      if (fileImagen) {
        const uploadResult = await uploadFile(fileImagen, "imagen").catch(
          (error) => {
            throw new Error(
              `Fallo subida Imagen Producto: ${
                error instanceof Error ? error.message : "Error desconocido"
              }`
            );
          }
        );
        if (uploadResult.success) {
          updatedFormData.imagen = fileImagen.name;
        }
      } else {
        if (formData.imagen !== undefined) {
          updatedFormData.imagen = formData.imagen;
        }
      }

      const url =
        isEditing && formData.id_automatizaciones
          ? `${API_BASE_URL}/${tableName}/${formData.id_automatizaciones}`
          : `${API_BASE_URL}/${tableName}`;

      const method = isEditing ? "patch" : "post";

      const response = await axios[method](
        url,
        { data: updatedFormData },
        {
          headers: {
            "Content-Type": "application/json",
            apikey: API_KEY,
          },
          timeout: 30000,
        }
      );

      const result = response.data;
      if (isEditing) {
        setAutomatizaciones(
          automatizaciones.map((item) =>
            item.id_automatizaciones === formData.id_automatizaciones
              ? result
              : item
          )
        );
      } else {
        setAutomatizaciones([...automatizaciones, result]);
      }

      resetForm();
      setSuccess(
        isEditing
          ? "Automatización actualizada correctamente"
          : "Automatización creada correctamente"
      );
    } catch (err) {
      if (err instanceof Error) {
        setError(
          err.message || "Error al guardar los datos de la automatización"
        );
      } else {
        setError("Error desconocido al guardar los datos de la automatización");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFileLogoEmpresaChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFileLogoEmpresa(selectedFile);
      setFormData({
        ...formData,
        logo_empresa: selectedFile.name,
      });
    } else {
      setFileLogoEmpresa(null);
      setFormData({
        ...formData,
        logo_empresa: "",
      });
    }
  };

  const handleFileImagenChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFileImagen(selectedFile);
      setFormData({
        ...formData,
        imagen: selectedFile.name,
      });
    } else {
      setFileImagen(null);
      setFormData({
        ...formData,
        imagen: "",
      });
    }
  };

  const handleTemplateChange = (selectedTemplate) => {
    setFormData((prev) => ({
      ...prev,
      template: selectedTemplate,
    }));
  };

  const handleDelete = async (id_automatizaciones) => {
    if (window.confirm("¿Estás seguro de eliminar esta automatización?")) {
      setLoading(true);
      try {
        await axios.delete(
          `${API_BASE_URL}/${tableName}/${id_automatizaciones}`,
          {
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
              "Cache-Control": "no-cache",
              apikey: API_KEY,
            },
            timeout: 30000,
          }
        );
        setAutomatizaciones(
          automatizaciones.filter(
            (item) => item.id_automatizaciones !== id_automatizaciones
          )
        );
        setSuccess("Automatización eliminada correctamente");
      } catch (err) {
        setError("Error al eliminar la automatización");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleEdit = (automatizacion) => {
    setFormData(automatizacion);
    setSelectedDate(
      automatizacion.fecha_ingreso
        ? new Date(automatizacion.fecha_ingreso)
        : null
    );
    setIsEditing(true);
    setError("");
    setSuccess("");
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setFileUrls({ logo_empresa: "", imagen: "" });
    setCurrentAutomatizacion(null);
    setCurrentFileView({ type: null, url: "", fileName: "" });
  };

  const renderFileIcon = (fileName) => {
    const type = getFileType(fileName);
    switch (type) {
      case "pdf":
        return <PictureAsPdfIcon style={{ color: "#e53935" }} />;
      case "image":
        return <ImageIcon style={{ color: "#43a047" }} />;
      default:
        return <InsertDriveFileIcon style={{ color: "#757575" }} />;
    }
  };

  const renderFilePreview = () => {
    if (!currentFileView.url || !currentFileView.fileName) return null;

    const fileType = getFileType(currentFileView.fileName);

    return (
      <div className="file-preview-container">
        <div className="file-preview-header">
          <h4>{currentFileView.fileName}</h4>
          <Button
            onClick={handleCloseFileView}
            startIcon={<CloseIcon />}
            variant="outlined"
            size="small"
          >
            Cerrar
          </Button>
        </div>

        <div className="file-preview-content">
          {fileType === "pdf" ? (
            <iframe
              src={currentFileView.url}
              width="100%"
              height="500px"
              title="PDF Viewer"
            />
          ) : fileType === "image" ? (
            <img
              src={currentFileView.url}
              alt="Preview"
              style={{ maxWidth: "100%", maxHeight: "500px" }}
            />
          ) : (
            <div className="unsupported-file">
              <p>Previsualización no disponible</p>
              <Button
                variant="contained"
                color="primary"
                href={currentFileView.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                Descargar archivo
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div>
      <h2>Automatizaciones TOL</h2>
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
      <Modal
        open={openModal}
        onClose={handleCloseModal}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
        BackdropProps={{
          style: {
            backgroundColor: "rgba(0,0,0,0.8)",
            zIndex: 1299,
          },
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: { xs: "90%", sm: "70%", md: "60%" },
            maxWidth: "800px",
            maxHeight: "90vh",
            bgcolor: "background.paper",
            border: "2px solid",
            borderColor: "primary.main",
            borderRadius: "12px",
            boxShadow: 24,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            zIndex: 1300,
          }}
        >
          {/* Header del Modal */}
          <Box
            sx={{
              padding: "16px 24px",
              background: "linear-gradient(135deg, #0709ab 0%, #2196f3 100%)",
              color: "white",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderBottom: "1px solid rgba(255, 255, 255, 0.2)",
            }}
          >
            <Typography
              id="modal-modal-title"
              variant="h6"
              component="h2"
              sx={{
                fontSize: "1.5rem",
                fontWeight: "600",
                letterSpacing: "0.5px",
              }}
            >
              Archivos de Automatización
            </Typography>
            <IconButton
              onClick={handleCloseModal}
              sx={{
                color: "white",
                "&:hover": {
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                },
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Contenido del Modal */}
          <Box
            sx={{
              p: 4,
              overflowY: "auto",
              flex: 1,
              maxHeight: "calc(90vh - 64px)",
            }}
          >
            {currentAutomatizacion && (
              <Box
                sx={{
                  mb: 4,
                  p: 3,
                  borderRadius: "8px",
                  background: "rgba(25, 118, 210, 0.05)",
                  border: "1px solid rgba(25, 118, 210, 0.2)",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
                }}
              >
                <Typography
                  variant="h6"
                  sx={{ color: "#1976d2", textAlign: "center", mb: 2 }}
                >
                  {currentAutomatizacion.nombre_producto}
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography>
                      <strong>ID:</strong>{" "}
                      {currentAutomatizacion.id_automatizaciones}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography>
                      <strong>Categoría:</strong>{" "}
                      {categorias.find(
                        (cat) =>
                          cat.id_categoria ===
                          currentAutomatizacion.id_categoria
                      )?.categoria || currentAutomatizacion.id_categoria}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography>
                      <strong>Proveedor:</strong>{" "}
                      {currentAutomatizacion.proveedor}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography>
                      <strong>Estado:</strong> {currentAutomatizacion.estado}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography>
                      <strong>Template:</strong>{" "}
                      {currentAutomatizacion.template || "No especificado"}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            )}

            {loadingUrls ? (
              <Box sx={{ textAlign: "center", py: 4, color: "#1976d2" }}>
                <CircularProgress color="inherit" />
                <Typography variant="body1" sx={{ mt: 2 }}>
                  Cargando archivos...
                </Typography>
              </Box>
            ) : (
              <Box>
                {currentFileView.type ? (
                  renderFilePreview()
                ) : (
                  <Grid container spacing={3}>
                    {/* Tarjeta Logo Empresa */}
                    <Grid item xs={12} md={6}>
                      <Box
                        sx={{
                          height: "100%",
                          p: 3,
                          border: "1px solid rgba(25, 118, 210, 0.3)",
                          borderRadius: "8px",
                          backgroundColor: "white",
                          transition: "all 0.3s ease",
                          "&:hover": {
                            transform: "translateY(-2px)",
                            boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                          },
                          display: "flex",
                          flexDirection: "column",
                        }}
                      >
                        <Box
                          sx={{ display: "flex", alignItems: "center", mb: 2 }}
                        >
                          <InsertDriveFileIcon
                            sx={{ color: "#1976d2", mr: 1 }}
                          />
                          <Typography
                            variant="subtitle1"
                            sx={{ color: "#1976d2", fontWeight: "medium" }}
                          >
                            Logo de la Empresa
                          </Typography>
                        </Box>
                        {fileUrls.logo_empresa &&
                        currentAutomatizacion?.logo_empresa ? (
                          <Box
                            sx={{
                              mt: 2,
                              display: "flex",
                              justifyContent: "center",
                              alignItems: "center",
                              height: "300px",
                              overflow: "hidden",
                            }}
                          >
                            {getFileType(currentAutomatizacion.logo_empresa) ===
                            "image" ? (
                              <img
                                src={fileUrls.logo_empresa}
                                alt="Logo de la empresa"
                                style={{
                                  maxWidth: "100%",
                                  maxHeight: "100%",
                                  objectFit: "contain",
                                }}
                              />
                            ) : (
                              <Button
                                variant="contained"
                                onClick={() =>
                                  handleViewFile(
                                    "logo_empresa",
                                    fileUrls.logo_empresa,
                                    currentAutomatizacion.logo_empresa
                                  )
                                }
                                sx={{
                                  background:
                                    "linear-gradient(45deg, #1976d2 30%, #2196f3 90%)",
                                  color: "white",
                                  fontWeight: "600",
                                  "&:hover": {
                                    background:
                                      "linear-gradient(45deg, #1565c0 30%, #1976d2 90%)",
                                  },
                                }}
                                fullWidth
                              >
                                Ver Archivo
                              </Button>
                            )}
                          </Box>
                        ) : (
                          <Typography
                            variant="body2"
                            sx={{ color: "text.disabled", mt: "auto" }}
                          >
                            No disponible
                          </Typography>
                        )}
                      </Box>
                    </Grid>

                    {/* Tarjeta Imagen Producto */}
                    <Grid item xs={12} md={6}>
                      <Box
                        sx={{
                          height: "100%",
                          p: 3,
                          border: "1px solid rgba(25, 118, 210, 0.3)",
                          borderRadius: "8px",
                          backgroundColor: "white",
                          transition: "all 0.3s ease",
                          "&:hover": {
                            transform: "translateY(-2px)",
                            boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                          },
                          display: "flex",
                          flexDirection: "column",
                        }}
                      >
                        <Box
                          sx={{ display: "flex", alignItems: "center", mb: 2 }}
                        >
                          <InsertDriveFileIcon
                            sx={{ color: "#1976d2", mr: 1 }}
                          />
                          <Typography
                            variant="subtitle1"
                            sx={{ color: "#1976d2", fontWeight: "medium" }}
                          >
                            Imagen del Producto
                          </Typography>
                        </Box>
                        {fileUrls.imagen && currentAutomatizacion?.imagen ? (
                          <Box
                            sx={{
                              mt: 2,
                              display: "flex",
                              justifyContent: "center",
                              alignItems: "center",
                              height: "300px",
                              overflow: "hidden",
                            }}
                          >
                            {getFileType(currentAutomatizacion.imagen) ===
                            "image" ? (
                              <img
                                src={fileUrls.imagen}
                                alt="Imagen del producto"
                                style={{
                                  maxWidth: "100%",
                                  maxHeight: "100%",
                                  objectFit: "contain",
                                }}
                              />
                            ) : (
                              <Button
                                variant="contained"
                                onClick={() =>
                                  handleViewFile(
                                    "imagen",
                                    fileUrls.imagen,
                                    currentAutomatizacion.imagen
                                  )
                                }
                                sx={{
                                  background:
                                    "linear-gradient(45deg, #1976d2 30%, #2196f3 90%)",
                                  color: "white",
                                  fontWeight: "600",
                                  "&:hover": {
                                    background:
                                      "linear-gradient(45deg, #1565c0 30%, #1976d2 90%)",
                                  },
                                }}
                                fullWidth
                              >
                                Ver Archivo
                              </Button>
                            )}
                          </Box>
                        ) : (
                          <Typography
                            variant="body2"
                            sx={{ color: "text.disabled", mt: "auto" }}
                          >
                            No disponible
                          </Typography>
                        )}
                      </Box>
                    </Grid>
                  </Grid>
                )}
              </Box>
            )}
          </Box>
        </Box>
      </Modal>

      <form onSubmit={handleSubmit} className="form">
        {isEditing && (
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-2">
              ID Automatización:
            </label>
            <input
              type="text"
              value={formData.id_automatizaciones || ""}
              disabled
              className="w-full max-w-lg p-2 border border-gray-300 rounded-md bg-gray-100"
            />
          </div>
        )}

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-medium mb-2">
            Nombre del Producto:
          </label>
          <input
            type="text"
            value={formData.nombre_producto}
            onChange={(e) =>
              setFormData({ ...formData, nombre_producto: e.target.value })
            }
            className="w-full max-w-2xl md:max-w-3xl lg:max-w-4xl p-2 border border-gray-300 rounded-md bg-gray-100"
            required
            disabled={loading}
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-medium mb-2">
            Descripción:
          </label>
          <input
            value={formData.descripcion}
            onChange={(e) =>
              setFormData({ ...formData, descripcion: e.target.value })
            }
            className="w-full max-w-lg p-2 border border-gray-300 rounded-md bg-gray-100"
            rows={3}
            disabled={loading}
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-medium mb-2">
            Categoría:
          </label>
          <Select
            options={categorias.map((cat) => ({
              value: cat.id_categoria,
              label: cat.categoria,
            }))}
            value={
              formData.id_categoria
                ? {
                    value: formData.id_categoria,
                    label:
                      categorias.find(
                        (cat) => cat.id_categoria === formData.id_categoria
                      )?.categoria || "Seleccione",
                  }
                : null
            }
            onChange={(selectedOption) =>
              setFormData({
                ...formData,
                id_categoria: selectedOption?.value || "",
              })
            }
            placeholder="Seleccione una categoría"
            className="w-full max-w-lg p-2 border border-gray-300 rounded-md bg-gray-100"
            isDisabled={loading}
          />
        </div>

        <div className="mb-4">
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Cantidad:
            </label>
            <input
              value={formData.cantidad}
              onChange={(e) =>
                setFormData({ ...formData, cantidad: e.target.value })
              }
              className="w-full max-w-lg p-2 border border-gray-300 rounded-md bg-gray-100"
              rows={3}
              disabled={loading}
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Precio Unitario:
            </label>
            <input
              value={formData.precio_unitario}
              onChange={(e) =>
                setFormData({ ...formData, precio_unitario: e.target.value })
              }
              className="w-full max-w-lg p-2 border border-gray-300 rounded-md bg-gray-100"
              rows={3}
              disabled={loading}
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-medium mb-2">
            Logo de la Empresa:
          </label>
          <input
            type="file"
            onChange={handleFileLogoEmpresaChange}
            className="w-full max-w-lg p-2 border border-gray-300 rounded-md bg-gray-100"
            disabled={loading}
            required={!isEditing || (isEditing && !formData.logo_empresa)}
            accept="image/*,.pdf"
          />
          {fileLogoEmpresa && (
            <p className="mt-2 text-sm text-gray-600">
              Archivo seleccionado: {fileLogoEmpresa.name}
            </p>
          )}
          {isEditing && !fileLogoEmpresa && formData.logo_empresa && (
            <p className="mt-2 text-sm text-gray-600">
              Archivo actual: {formData.logo_empresa}
            </p>
          )}
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-medium mb-2">
            Imagen del Producto:
          </label>
          <input
            type="file"
            onChange={handleFileImagenChange}
            className="w-full max-w-lg p-2 border border-gray-300 rounded-md bg-gray-100"
            disabled={loading}
            required={!isEditing || (isEditing && !formData.imagen)}
            accept="image/*,.pdf"
          />
          {fileImagen && (
            <p className="mt-2 text-sm text-gray-600">
              Archivo seleccionado: {fileImagen.name}
            </p>
          )}
          {isEditing && !fileImagen && formData.imagen && (
            <p className="mt-2 text-sm text-gray-600">
              Archivo actual: {formData.imagen}
            </p>
          )}
        </div>

        <div className="mb-4">
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Proveedor:
            </label>
            <input
              type="text"
              value={formData.proveedor}
              onChange={(e) =>
                setFormData({ ...formData, proveedor: e.target.value })
              }
              className="w-full max-w-lg p-2 border border-gray-300 rounded-md bg-gray-100"
              disabled={loading}
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Fecha de Ingreso:
            </label>
            <DatePicker
              selected={selectedDate}
              onChange={(date) => setSelectedDate(date)}
              dateFormat="yyyy-MM-dd"
              className="w-full max-w-lg p-2 border border-gray-300 rounded-md bg-gray-100"
              placeholderText="Seleccione la fecha"
              disabled={loading}
            />
          </div>
        </div>

        <div className="mb-4">
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Código de Barras:
            </label>
            <input
              type="text"
              value={formData.codigo_barras}
              onChange={(e) =>
                setFormData({ ...formData, codigo_barras: e.target.value })
              }
              className="w-full max-w-lg p-2 border border-gray-300 rounded-md bg-gray-100"
              disabled={loading}
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Estado:
            </label>
            <Select
              options={[
                { value: "Oferta", label: "Oferta" },
                { value: "Lanzamiento", label: "Lanzamiento" },
                { value: "Regreso", label: "Regreso" },
              ]}
              value={
                formData.estado
                  ? {
                      value: formData.estado,
                      label: formData.estado,
                    }
                  : null
              }
              onChange={(selectedOption) =>
                setFormData({
                  ...formData,
                  estado: selectedOption?.value || "Oferta",
                })
              }
              className="w-full"
              isDisabled={loading}
            />
          </div>
        </div>

        {/* Sección de Templates */}
<div className="mb-4">
  <label className="block text-gray-700 text-sm font-medium mb-2">
    Plantilla:
  </label>
  <div id="template-selector-container"></div>
  <ImageRadioSelector
    containerId="template-selector-container"
    options={templateOptions.map(option => ({
      value: option.id,
      imgSrc: option.image,
      alt: option.label,
      checked: formData.template === option.id
    }))}
    name="template-radio"
    onChange={handleTemplateChange}
  />
</div>

        <div className="flex gap-2">
          <button
            type="submit"
            className="button button-primary"
            disabled={loading}
          >
            {loading ? "Procesando..." : isEditing ? "Actualizar" : "Agregar"}
          </button>

          {isEditing && (
            <button
              type="button"
              onClick={resetForm}
              className="button button-secondary"
              disabled={loading}
            >
              Cancelar
            </button>
          )}
        </div>
      </form>

      <div className="search-container">
        <label className="block text-gray-700 text-sm font-medium mb-2">
          Buscar automatizaciones :
        </label>
        <input
          type="text"
          placeholder="Buscar por nombre, descripción, categoría..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="search-input w-full max-w-lg p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          disabled={loading}
        />
      </div>

      <div style={{ overflow: "hidden" }}>
        <button
          onClick={() => {
            fetchAutomatizaciones();
            fetchCategorias();
          }}
          className="button button-primary"
          disabled={loading}
          style={{ float: "right" }}
        >
          {loading ? "Recargando..." : "Recargar Tabla"}
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre Producto</th>
              <th>Categoría</th>
              <th>Cantidad</th>
              <th>Precio</th>
              <th>Proveedor</th>
              <th>Logo Empresa</th>
              <th>Imagen Producto</th>
              <th>Estado</th>
              <th>Template</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((item) => (
              <tr key={item.id_automatizaciones}>
                <td>{item.id_automatizaciones}</td>
                <td>{item.nombre_producto}</td>
                <td>
                  {categorias.find(
                    (cat) => cat.id_categoria === item.id_categoria
                  )?.categoria || item.id_categoria}
                </td>
                <td>{item.cantidad}</td>
                <td>{item.precio_unitario}</td>
                <td>{item.proveedor}</td>
                <td className="truncate max-w-xs">{item.logo_empresa}</td>
                <td className="truncate max-w-xs">{item.imagen}</td>
                <td>
                  <span className={`status ${item.estado.toLowerCase()}`}>
                    {item.estado}
                  </span>
                </td>
                <td>{item.template || "-"}</td>
                <td>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(item)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#0447fb",
                        cursor: "pointer",
                        padding: "4px",
                      }}
                      onMouseOver={(e) =>
                        (e.currentTarget.style.color = "#3b82f6")
                      }
                      onMouseOut={(e) =>
                        (e.currentTarget.style.color = "#0447fb")
                      }
                      disabled={loading}
                    >
                      <EditSquareIcon fontSize="small" />
                    </button>

                    <button
                      onClick={() => handleOpenModal(item)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#10b981",
                        cursor: "pointer",
                        padding: "4px",
                      }}
                      onMouseOver={(e) =>
                        (e.currentTarget.style.color = "#059669")
                      }
                      onMouseOut={(e) =>
                        (e.currentTarget.style.color = "#10b981")
                      }
                      disabled={loading}
                    >
                      <ImageIcon fontSize="small" />
                    </button>

                    <button
                      onClick={() => handleDelete(item.id_automatizaciones)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#ef4444",
                        cursor: "pointer",
                        padding: "4px",
                      }}
                      onMouseOver={(e) =>
                        (e.currentTarget.style.color = "#dc2626")
                      }
                      onMouseOut={(e) =>
                        (e.currentTarget.style.color = "#ef4444")
                      }
                      disabled={loading}
                    >
                      <DeleteIcon fontSize="small" />
                    </button>

                    <button
                      onClick={async () => {
                        try {
                          console.log("Enviando item a la API:", item);
                          const response = await fetch(
                            "https://hook.us2.make.com/mr4jjtjadaouska8da6ed24bo7px20xg",
                            {
                              method: "POST",
                              headers: {
                                "Content-Type": "application/json",
                              },
                              body: JSON.stringify(item),
                            }
                          );

                          if (!response.ok)
                            throw new Error("Error en la respuesta");
                          const data = await response.json();
                          console.log("Respuesta de la API:", data);
                        } catch (error) {
                          console.error("Error al enviar a la API:", error);
                        }
                      }}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#0447fb",
                        cursor: "pointer",
                        padding: "4px",
                        transition: "color 0.2s ease",
                      }}
                      onMouseOver={(e) =>
                        (e.currentTarget.style.color = "#3b82f6")
                      }
                      onMouseOut={(e) =>
                        (e.currentTarget.style.color = "#0447fb")
                      }
                      disabled={loading}
                    >
                      <SendIcon fontSize="small" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredItems.length > itemsPerPage && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              marginTop: "20px",
              gap: "15px",
            }}
          >
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                color: currentPage === 1 ? "#ccc" : "#3b82f6",
              }}
            >
              <ArrowBackIosIcon fontSize="medium" />
            </button>

            <span style={{ margin: "0 10px" }}>
              Página {currentPage} de {totalPages}
            </span>

            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                color: currentPage === totalPages ? "#ccc" : "#3b82f6",
              }}
            >
              <ArrowForwardIosIcon fontSize="medium" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
