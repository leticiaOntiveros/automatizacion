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
import TemplateCarousel from "./TemplateCarousel";
import template1 from '../../components/images/template1.png';
import template2 from '../../components/images/template2.png';
import template3 from '../../components/images/template3.png';
import template4 from '../../components/images/template4.png';
import template5 from '../../components/images/template5.png';
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


export default function AutomatizacionesSTOLForm() {
  const [automatizaciones, setAutomatizaciones] = useState([]);
  // Definir los campos de la base de datos
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

  // Opciones pra el manejo del carrusel de los templates
  const templateOptions = [
    {
      id: "Template   1",
      label: "Template 1",
      image:
        template1,
    },
    {
      id: "Template 2",
      label: "Template 2",
      image:
        template2,
    },
    {
      id: "Template 3",
      label: "Template 3",  
      image:
        template3,
    },
    {
      id: "Template 4",
      label: "Template 4",
      image:
        template4,
    },
    {
      id: "Template 5",
      label: "Template 5",
      image:
        template5,
    },
  ];
 //definir las variables y el modos
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

  //llamados de las apis para hacer las peticiones
  const API_BASE_URL =
    "https://theoriginallab-automatizacionestol-back.m0oqwu.easypanel.host";
  const API_KEY = "lety";
  const tableName = "formulario";
  const CORS_PROXY = "https://thingproxy.freeboard.io/fetch/";


//metodo que maneja el buscador de los items
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

//estados iniciales para el manejo de los archivos
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

  //metodo para abrir el modal y cargar los archivos
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
          `${CORS_PROXY}https://kneib5mp53.execute-api.us-west-2.amazonaws.com/dev/getObject`,
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
//hacer las peticiones para cargar las imagenes desde el bucket a AWS S3
      if (automatizacion.imagen) {
        const imagenRequestBody = { fileName: automatizacion.imagen };
        const postResponse = await axios.post(
          `${CORS_PROXY}https://kneib5mp53.execute-api.us-west-2.amazonaws.com/dev/getObject`,
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
 //metodo para abrir el archivo en el modal
  const handleViewFile = (type, url, fileName) => {
    setCurrentFileView({ type, url, fileName });
  };
//metodo para cerrar el archivo del modal
  const handleCloseFileView = () => {
    setCurrentFileView({ type: null, url: "", fileName: "" });
  };

  const uploadFile = async (file, fileNameKey) => {
    const filename = file.name;

    try {
      const fileArrayBuffer = await file.arrayBuffer();
      const fileBlob = new Blob([fileArrayBuffer], { type: file.type });

      const response = await axios.put(
        `${CORS_PROXY}https://kneib5mp53.execute-api.us-west-2.amazonaws.com/dev/folder/bucket-rodval/${filename}`,
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
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
      zIndex: 1300,
    }}
  >
    {/* Header del Modal */}
    <Box
      sx={{
        p: 2,
        backgroundColor: "#134647",
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
        sx={{ fontSize: "1.5rem", fontWeight: 600 }}
      >
        Archivos de Automatización
      </Typography>
      <IconButton
        onClick={handleCloseModal}
        sx={{
          color: "white",
          "&:hover": { backgroundColor: "rgba(255,255,255,0.1)" },
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
      }}
    >
      {currentAutomatizacion && (
        <Box
          sx={{
            mb: 4,
            p: 3,
            borderRadius: "8px",
            backgroundColor: "rgba(167, 167, 167, 0.05)",
            border: "1px solid #134647",
            boxShadow: "0 4px 6px -1px rgba(173, 173, 173, 0.05)",
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
              <Typography><strong>ID:</strong> {currentAutomatizacion.id_automatizaciones}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography><strong>Categoría:</strong> {categorias.find(cat => cat.id_categoria === currentAutomatizacion.id_categoria)?.categoria || currentAutomatizacion.id_categoria}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography><strong>Proveedor:</strong> {currentAutomatizacion.proveedor}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography><strong>Estado:</strong> {currentAutomatizacion.estado}</Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography><strong>Template:</strong> {currentAutomatizacion.template || "No especificado"}</Typography>
            </Grid>
          </Grid>
        </Box>
      )}

      {loadingUrls ? (
        <Box sx={{ textAlign: "center", py: 4 }}>
          <CircularProgress color="inherit" />
          <Typography variant="body1" sx={{ mt: 2 }}>
            Cargando archivos...
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {/* Tarjeta Logo Empresa */}
          <Grid item xs={12} md={6}>
            <Box
              sx={{
                height: "100%",
                p: 3,
                border: "1px solid rgba(19, 70, 71, 0.3)",
                borderRadius: "8px",
                backgroundColor: "white",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                },
              }}
            >
              <InsertDriveFileIcon sx={{ color: "#134647", mb: 1 }} />
              <Typography variant="subtitle1" sx={{ color: "#134647", fontWeight: "medium", mb: 2 }}>
                Logo de la Empresa
              </Typography>
              {fileUrls.logo_empresa && currentAutomatizacion?.logo_empresa ? (
                <Box sx={{ height: "300px", width: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}>
                  {getFileType(currentAutomatizacion.logo_empresa) === "image" ? (
                    <img
                      src={fileUrls.logo_empresa}
                      alt="Logo de la empresa"
                      style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
                    />
                  ) : (
                    <Button
                      variant="contained"
                      fullWidth
                      onClick={() => handleViewFile("logo_empresa", fileUrls.logo_empresa, currentAutomatizacion.logo_empresa)}
                      sx={{
                        background: "linear-gradient(45deg, #1976d2 30%, #2196f3 90%)",
                        color: "white",
                        fontWeight: "600",
                        "&:hover": { background: "linear-gradient(45deg, #1565c0 30%, #1976d2 90%)" },
                      }}
                    >
                      Ver Archivo
                    </Button>
                  )}
                </Box>
              ) : (
                <Typography variant="body2" sx={{ color: "text.disabled" }}>
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
                border: "1px solid rgba(19, 70, 71, 0.3)",
                borderRadius: "8px",
                backgroundColor: "white",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                },
              }}
            >
              <InsertDriveFileIcon sx={{ color: "#134647", mb: 1 }} />
              <Typography variant="subtitle1" sx={{ color: "#134647", fontWeight: "medium", mb: 2 }}>
                Imagen del Producto
              </Typography>
              {fileUrls.imagen && currentAutomatizacion?.imagen ? (
                <Box sx={{ height: "300px", width: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}>
                  {getFileType(currentAutomatizacion.imagen) === "image" ? (
                    <img
                      src={fileUrls.imagen}
                      alt="Imagen del producto"
                      style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
                    />
                  ) : (
                    <Button
                      variant="contained"
                      fullWidth
                      onClick={() => handleViewFile("imagen", fileUrls.imagen, currentAutomatizacion.imagen)}
                      sx={{
                        background: "linear-gradient(45deg, #1976d2 30%, #2196f3 90%)",
                        color: "white",
                        fontWeight: "600",
                        "&:hover": { background: "linear-gradient(45deg, #1565c0 30%, #1976d2 90%)" },
                      }}
                    >
                      Ver Archivo
                    </Button>
                  )}
                </Box>
              ) : (
                <Typography variant="body2" sx={{ color: "text.disabled" }}>
                  No disponible
                </Typography>
              )}
            </Box>
          </Grid>
        </Grid>
      )}
    </Box>
  </Box>
</Modal>
      
      {/* Formulario del dashboard */} 
  <form onSubmit={handleSubmit} className="form-uniform">
  <div className="form-row-uniform">
    <div className="form-group-uniform">
      <label className="uniform-label">
        Nombre del Producto:
      </label>
      <input
        type="text"
        value={formData.nombre_producto}
        onChange={(e) => setFormData({ ...formData, nombre_producto: e.target.value })}
        className="uniform-input"
        required
        disabled={loading}
      />
    </div>

    <div className="form-group-uniform">
      <label className="uniform-label">
        Descripción:
      </label>
      <input
        value={formData.descripcion}
        onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
        className="uniform-input"
        disabled={loading}
      />
    </div>

    <div className="form-group-uniform">
      <label className="uniform-label">
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
                label: categorias.find((cat) => cat.id_categoria === formData.id_categoria)?.categoria || "Seleccione",
              }
            : null
        }
        onChange={(selectedOption) =>
          setFormData({
            ...formData,
            id_categoria: selectedOption?.value || "",
          })
        }
        placeholder="Seleccione"
        className="uniform-select"
        isDisabled={loading}
      />
    </div>
  </div>

  {/* Segunda fila */}
  <div className="form-row-uniform">
    <div className="form-group-uniform">
      <label className="uniform-label">
        Cantidad:
      </label>
      <input
        type="number"
        value={formData.cantidad}
        onChange={(e) => setFormData({ ...formData, cantidad: e.target.value })}
        className="uniform-input"
        disabled={loading}
      />
    </div>

    <div className="form-group-uniform">
      <label className="uniform-label">
        Precio Unitario:
      </label>
      <input
        type="number"
        value={formData.precio_unitario}
        onChange={(e) => setFormData({ ...formData, precio_unitario: e.target.value })}
        className="uniform-input"
        disabled={loading}
      />
    </div>

    <div className="form-group-uniform">
      <label className="uniform-label">
        Logo Empresa:
      </label>
      <div className="uniform-file-upload">
        <input
          type="file"
          id="file-upload"
          onChange={handleFileLogoEmpresaChange}
          className="uniform-file-input"
          disabled={loading}
          accept="image/*,.pdf"
          required={!isEditing || (isEditing && !formData.logo_empresa)}
        />
        <label htmlFor="file-upload" className="uniform-file-button">
        📷 Logo empresa
        </label>
        {fileLogoEmpresa && (
          <p className="uniform-file-info">{fileLogoEmpresa.name}</p>
        )}
      </div>
    </div>
  </div>

  {/* Tercera fila */}
  <div className="form-row-uniform">
    <div className="form-group-uniform">
      <label className="uniform-label">
        Imagen Producto:
      </label>
      <div className="uniform-file-upload">
        <input
          type="file"
          id="file-upload-producto"
          onChange={handleFileImagenChange}
          className="uniform-file-input"
          disabled={loading}
          accept="image/*,.pdf"
          required={!isEditing || (isEditing && !formData.imagen)}
        />
        <label htmlFor="file-upload-producto" className="uniform-file-button">
          📷 Imagen del producto
        </label>
        {fileImagen && (
          <p className="uniform-file-info">{fileImagen.name}</p>
        )}
      </div>
    </div>

    <div className="form-group-uniform">
      <label className="uniform-label">
        Proveedor:
      </label>
      <input
        type="text"
        value={formData.proveedor}
        onChange={(e) => setFormData({ ...formData, proveedor: e.target.value })}
        className="uniform-input"
        disabled={loading}
      />
    </div>

    <div className="form-group-uniform">
      <label className="uniform-label">
        Fecha Ingreso:
      </label>
      <DatePicker
        selected={selectedDate}
        onChange={(date) => setSelectedDate(date)}
        dateFormat="yyyy-MM-dd"
        className="uniform-input"
        placeholderText="Fecha"
        disabled={loading}
      />
    </div>
  </div>

  {/* Cuarta fila */}
  <div className="form-row-uniform">
    <div className="form-group-uniform">
      <label className="uniform-label">
        Código Barras:
      </label>
      <input
        type="text"
        value={formData.codigo_barras}
        onChange={(e) => setFormData({ ...formData, codigo_barras: e.target.value })}
        className="uniform-input"
        required
        disabled={loading}
      />
    </div>

    <div className="form-group-uniform">
      <label className="uniform-label">
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
        className="uniform-select"
        isDisabled={loading}
      />
    </div>

    {isEditing && (
      <div className="form-group-uniform">
        <label className="uniform-label">
          ID:
        </label>
        <input
          type="text"
          value={formData.id_automatizaciones || ""}
          className="uniform-input"
          disabled
        />
      </div>
    )}
  </div>

  {/* Sección del carrusel */}
  <div className="form-row-uniform">
    <div className="form-group-full-width">
    <TemplateCarousel 
      templateOptions={templateOptions}
      formData={formData}
      handleTemplateChange={({ target }) => {
        setFormData({
          ...formData,
          template: target.value // Extrae solo el value
        });
      }}
      value={formData.template}
    />
    </div>
  </div>

  {/* Botones */}
  <div className="form-buttons-uniform">
    <button
      type="submit"
      className="uniform-submit-button"
      disabled={loading}
    >
      {loading ? "Procesando..." : isEditing ? "Actualizar" : "Agregar"}
    </button>

    {isEditing && (
      <button
        type="button"
        onClick={resetForm}
        className="uniform-cancel-button"
        disabled={loading}
      >
        Cancelar
      </button>
    )}
  </div>
</form>

      <div className="search-container" style={{ marginBottom: "25px" }}>
        <input
          type="text"
          placeholder= "🔍 Buscar por nombre, descripción, categoría..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          style={{
            width: "800px",
            maxWidth: "100%",
            padding: "0.5rem",
            border: "1px solid rgb(157, 157, 157)",
            borderRadius: "0.800rem",
            backgroundColor: "#ffffff",
          }}
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
          style={{ float: "left" }}
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
                <td>{item.template}</td>
                <td>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(item)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#134647",
                        cursor: "pointer",
                        padding: "4px",
                      }}
                      onMouseOver={(e) =>
                        (e.currentTarget.style.color = "#134647")
                      }
                      onMouseOut={(e) =>
                        (e.currentTarget.style.color = "#134647")
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
                        color: "#134647",
                        cursor: "pointer",
                        padding: "4px",
                      }}
                      onMouseOver={(e) =>
                        (e.currentTarget.style.color = "#134647")
                      }
                      onMouseOut={(e) =>
                        (e.currentTarget.style.color = "#134647")
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
                        color: "#134647",
                        cursor: "pointer",
                        padding: "4px",
                      }}
                      onMouseOver={(e) =>
                        (e.currentTarget.style.color = "#134647")
                      }
                      onMouseOut={(e) =>
                        (e.currentTarget.style.color = "#134647")
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
                        color: "#134647",
                        cursor: "pointer",
                        padding: "4px",
                        transition: "color 0.2s ease",
                      }}
                      onMouseOver={(e) =>
                        (e.currentTarget.style.color = "#134647")
                      }
                      onMouseOut={(e) =>
                        (e.currentTarget.style.color = "#134647")
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
