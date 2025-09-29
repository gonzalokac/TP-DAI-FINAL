import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  FlatList,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

// Datos de templos con comentarios
const templosData = [
  {
    id: 1,
    nombre: "Templo Beth El",
    ubicacion: "Recoleta, CABA",
    coordenadas: { latitude: -34.5887, longitude: -58.3926 },
    rating: 4.8,
    totalComentarios: 45,
    descripcion: "Templo judío con servicios religiosos y eventos comunitarios",
    horarios: "Servicios: Vie 19:00, Sáb 10:00",
    telefono: "+54 11 5678-9012",
    servicios: ["Shabat", "Bar/Bat Mitzvá", "Clases de Hebreo", "Eventos Comunitarios"],
    proximoEvento: {
      fecha: "2025-03-15",
      titulo: "Servicio de Shabat Especial",
      descripcion: "Servicio de Shabat con música en vivo"
    }
  },
  {
    id: 2,
    nombre: "Templo Libertad",
    ubicacion: "Once, CABA",
    coordenadas: { latitude: -34.6087, longitude: -58.4056 },
    rating: 4.6,
    totalComentarios: 32,
    descripcion: "Templo histórico en el barrio de Once",
    horarios: "Servicios: Vie 18:30, Sáb 9:30",
    telefono: "+54 11 4567-8901",
    servicios: ["Shabat", "Festividades", "Educación", "Actividades Sociales"],
    proximoEvento: {
      fecha: "2025-03-20",
      titulo: "Conferencia sobre Historia Judía",
      descripcion: "Charla sobre la historia de la comunidad judía en Argentina"
    }
  },
  {
    id: 3,
    nombre: "Templo Or Torah",
    ubicacion: "Belgrano, CABA",
    coordenadas: { latitude: -34.6147, longitude: -58.4026 },
    rating: 4.9,
    totalComentarios: 28,
    descripcion: "Templo moderno con amplias instalaciones",
    horarios: "Servicios: Vie 19:15, Sáb 10:15",
    telefono: "+54 11 3456-7890",
    servicios: ["Shabat", "Bar/Bat Mitzvá", "Clases de Torá", "Grupos Juveniles"],
    proximoEvento: {
      fecha: "2025-03-18",
      titulo: "Cena Comunitaria de Purim",
      descripcion: "Cena especial para celebrar Purim con toda la comunidad"
    }
  },
  {
    id: 4,
    nombre: "Templo Beth Israel",
    ubicacion: "Palermo, CABA",
    coordenadas: { latitude: -34.5827, longitude: -58.4316 },
    rating: 4.7,
    totalComentarios: 38,
    descripcion: "Templo con enfoque en la juventud y familias",
    horarios: "Servicios: Vie 18:45, Sáb 9:45",
    telefono: "+54 11 2345-6789",
    servicios: ["Shabat", "Bar/Bat Mitzvá", "Programas Juveniles", "Actividades Familiares"],
    proximoEvento: {
      fecha: "2025-03-22",
      titulo: "Taller de Cocina Kosher",
      descripcion: "Aprende a preparar platos tradicionales kosher"
    }
  },
  {
    id: 5,
    nombre: "Templo Emanuel",
    ubicacion: "Villa Crespo, CABA",
    coordenadas: { latitude: -34.5967, longitude: -58.4367 },
    rating: 4.5,
    totalComentarios: 25,
    descripcion: "Templo con tradición y modernidad",
    horarios: "Servicios: Vie 19:00, Sáb 10:00",
    telefono: "+54 11 1234-5678",
    servicios: ["Shabat", "Festividades", "Educación Adulta", "Servicios Sociales"],
    proximoEvento: {
      fecha: "2025-03-25",
      titulo: "Concierto de Música Klezmer",
      descripcion: "Espectáculo de música tradicional judía"
    }
  }
];

export default function ComentariosScreen() {
  const [temploSeleccionado, setTemploSeleccionado] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [nuevoComentario, setNuevoComentario] = useState('');
  const [rating, setRating] = useState(5);
  const [comentarios, setComentarios] = useState({});
  const [filtroRating, setFiltroRating] = useState('Todos');
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    cargarComentarios();
  }, []);

  const cargarComentarios = async () => {
    try {
      const comentariosGuardados = await AsyncStorage.getItem('comentariosTemplos');
      if (comentariosGuardados) {
        setComentarios(JSON.parse(comentariosGuardados));
      }
    } catch (error) {
      console.error('Error al cargar comentarios:', error);
    }
  };

  const guardarComentarios = async (nuevosComentarios) => {
    try {
      await AsyncStorage.setItem('comentariosTemplos', JSON.stringify(nuevosComentarios));
      setComentarios(nuevosComentarios);
    } catch (error) {
      console.error('Error al guardar comentarios:', error);
    }
  };

  const agregarComentario = () => {
    if (!nuevoComentario.trim() || !temploSeleccionado) return;

    const comentario = {
      id: Date.now(),
      texto: nuevoComentario.trim(),
      rating: rating,
      fecha: new Date().toLocaleDateString('es-ES'),
      hora: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
      autor: 'Usuario' // En una app real sería el usuario logueado
    };

    const temploId = temploSeleccionado.id;
    const comentariosActuales = comentarios[temploId] || [];
    const nuevosComentarios = {
      ...comentarios,
      [temploId]: [...comentariosActuales, comentario]
    };

    guardarComentarios(nuevosComentarios);
    setNuevoComentario('');
    setRating(5);
    setModalVisible(false);
    Alert.alert('✅ Comentario agregado', 'Tu reseña ha sido guardada');
  };

  const copiarInformacionTemplo = async (templo) => {
    const info = `🕍 ${templo.nombre}\n📍 ${templo.ubicacion}\n📝 ${templo.descripcion}\n⏰ ${templo.horarios}\n📞 ${templo.telefono}\n⭐ Rating: ${templo.rating}/5\n💬 ${templo.totalComentarios} comentarios`;
    
    try {
      await Clipboard.setStringAsync(info);
      Alert.alert('✅ Copiado', 'Información del templo copiada al portapapeles');
    } catch (error) {
      Alert.alert('❌ Error', 'No se pudo copiar la información');
    }
  };

  const copiarComentario = async (comentario) => {
    const info = `💬 Comentario sobre ${temploSeleccionado?.nombre}\n⭐ Rating: ${comentario.rating}/5\n📅 ${comentario.fecha} ${comentario.hora}\n👤 ${comentario.autor}\n\n"${comentario.texto}"`;
    
    try {
      await Clipboard.setStringAsync(info);
      Alert.alert('✅ Copiado', 'Comentario copiado al portapapeles');
    } catch (error) {
      Alert.alert('❌ Error', 'No se pudo copiar el comentario');
    }
  };

  const renderStars = (rating, size = 16) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Ionicons
        key={index}
        name={index < rating ? 'star' : 'star-outline'}
        size={size}
        color="#FFD700"
      />
    ));
  };

  const filtrarTemplos = () => {
    return templosData.filter(templo => {
      const cumpleBusqueda = templo.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
                            templo.ubicacion.toLowerCase().includes(busqueda.toLowerCase());
      
      let cumpleRating = true;
      if (filtroRating !== 'Todos') {
        const ratingMin = parseInt(filtroRating);
        cumpleRating = templo.rating >= ratingMin;
      }
      
      return cumpleBusqueda && cumpleRating;
    });
  };

  const renderTemploCard = ({ item }) => {
    const comentariosTemplo = comentarios[item.id] || [];
    const ratingPromedio = comentariosTemplo.length > 0 
      ? (comentariosTemplo.reduce((sum, c) => sum + c.rating, 0) / comentariosTemplo.length).toFixed(1)
      : item.rating;

    return (
      <TouchableOpacity
        style={styles.temploCard}
        onPress={() => {
          setTemploSeleccionado(item);
          setModalVisible(true);
        }}
      >
        <View style={styles.temploHeader}>
          <View style={styles.temploInfo}>
            <Text style={styles.temploNombre}>🕍 {item.nombre}</Text>
            <Text style={styles.temploUbicacion}>📍 {item.ubicacion}</Text>
          </View>
          <TouchableOpacity
            style={styles.copiarButton}
            onPress={() => copiarInformacionTemplo(item)}
          >
            <Ionicons name="copy" size={20} color="#667eea" />
          </TouchableOpacity>
        </View>

        <Text style={styles.temploDescripcion}>{item.descripcion}</Text>
        
        <View style={styles.temploStats}>
          <View style={styles.ratingContainer}>
            {renderStars(Math.round(ratingPromedio))}
            <Text style={styles.ratingText}>{ratingPromedio}</Text>
          </View>
          <View style={styles.comentariosCount}>
            <Ionicons name="chatbubbles" size={16} color="#666" />
            <Text style={styles.comentariosCountText}>{comentariosTemplo.length} comentarios</Text>
          </View>
        </View>

        <View style={styles.serviciosContainer}>
          <Text style={styles.serviciosTitle}>Servicios:</Text>
          <View style={styles.serviciosList}>
            {item.servicios.slice(0, 3).map((servicio, index) => (
              <View key={index} style={styles.servicioTag}>
                <Text style={styles.servicioText}>{servicio}</Text>
              </View>
            ))}
            {item.servicios.length > 3 && (
              <Text style={styles.masServicios}>+{item.servicios.length - 3} más</Text>
            )}
          </View>
        </View>

        <View style={styles.proximoEvento}>
          <Text style={styles.proximoEventoTitle}>📅 Próximo Evento:</Text>
          <Text style={styles.proximoEventoTexto}>{item.proximoEvento.titulo}</Text>
          <Text style={styles.proximoEventoFecha}>{item.proximoEvento.fecha}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderComentario = ({ item }) => (
    <View style={styles.comentarioItem}>
      <View style={styles.comentarioHeader}>
        <View style={styles.comentarioAutor}>
          <Text style={styles.comentarioAutorNombre}>{item.autor}</Text>
          <View style={styles.comentarioRating}>
            {renderStars(item.rating, 14)}
          </View>
        </View>
        <View style={styles.comentarioFecha}>
          <Text style={styles.comentarioFechaTexto}>{item.fecha} {item.hora}</Text>
          <TouchableOpacity onPress={() => copiarComentario(item)}>
            <Ionicons name="copy" size={16} color="#667eea" />
          </TouchableOpacity>
        </View>
      </View>
      <Text style={styles.comentarioTexto}>{item.texto}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#667eea", "#764ba2"]} style={styles.header}>
        <Text style={styles.headerTitle}>💬 Comentarios y Reseñas</Text>
        <Text style={styles.headerSubtitle}>Descubre la opinión de la comunidad</Text>
      </LinearGradient>

      {/* Filtros y búsqueda */}
      <View style={styles.filtrosContainer}>
        <TextInput
          style={styles.busquedaInput}
          placeholder="Buscar templos..."
          placeholderTextColor="#999"
          value={busqueda}
          onChangeText={setBusqueda}
        />
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtrosScroll}>
          {['Todos', '5', '4', '3', '2', '1'].map((filtro) => (
            <TouchableOpacity
              key={filtro}
              style={[
                styles.filtroButton,
                filtroRating === filtro && styles.filtroButtonActive
              ]}
              onPress={() => setFiltroRating(filtro)}
            >
              <Text style={[
                styles.filtroText,
                filtroRating === filtro && styles.filtroTextActive
              ]}>
                {filtro === 'Todos' ? 'Todos' : `${filtro}+ ⭐`}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Lista de templos */}
      <FlatList
        data={filtrarTemplos()}
        renderItem={renderTemploCard}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.templosList}
        showsVerticalScrollIndicator={false}
      />

      {/* Modal de comentarios */}
      <Modal
        animationType="slide"
        transparent={false}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        {temploSeleccionado && (
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>{temploSeleccionado.nombre}</Text>
            </View>

            <ScrollView style={styles.modalContent}>
              {/* Información del templo */}
              <View style={styles.temploInfoModal}>
                <Text style={styles.temploUbicacionModal}>📍 {temploSeleccionado.ubicacion}</Text>
                <Text style={styles.temploDescripcionModal}>{temploSeleccionado.descripcion}</Text>
                <Text style={styles.temploHorarios}>⏰ {temploSeleccionado.horarios}</Text>
                <Text style={styles.temploTelefono}>📞 {temploSeleccionado.telefono}</Text>
                
                <View style={styles.serviciosModal}>
                  <Text style={styles.serviciosTitleModal}>Servicios disponibles:</Text>
                  {temploSeleccionado.servicios.map((servicio, index) => (
                    <Text key={index} style={styles.servicioItem}>• {servicio}</Text>
                  ))}
                </View>
              </View>

              {/* Formulario de nuevo comentario */}
              <View style={styles.nuevoComentarioSection}>
                <Text style={styles.nuevoComentarioTitle}>📝 Agregar Comentario</Text>
                
                <View style={styles.ratingInput}>
                  <Text style={styles.ratingLabel}>Calificación:</Text>
                  <View style={styles.starsInput}>
                    {Array.from({ length: 5 }, (_, index) => (
                      <TouchableOpacity
                        key={index}
                        onPress={() => setRating(index + 1)}
                      >
                        <Ionicons
                          name={index < rating ? 'star' : 'star-outline'}
                          size={30}
                          color="#FFD700"
                        />
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <TextInput
                  style={styles.comentarioInput}
                  placeholder="Escribe tu comentario sobre este templo..."
                  placeholderTextColor="#999"
                  value={nuevoComentario}
                  onChangeText={setNuevoComentario}
                  multiline
                  numberOfLines={4}
                />

                <TouchableOpacity
                  style={[
                    styles.enviarComentarioButton,
                    (!nuevoComentario.trim()) && styles.enviarComentarioButtonDisabled
                  ]}
                  onPress={agregarComentario}
                  disabled={!nuevoComentario.trim()}
                >
                  <Text style={styles.enviarComentarioButtonText}>Enviar Comentario</Text>
                </TouchableOpacity>
              </View>

              {/* Lista de comentarios */}
              <View style={styles.comentariosSection}>
                <Text style={styles.comentariosTitle}>
                  💬 Comentarios ({comentarios[temploSeleccionado.id]?.length || 0})
                </Text>
                
                <FlatList
                  data={comentarios[temploSeleccionado.id] || []}
                  renderItem={renderComentario}
                  keyExtractor={(item) => item.id.toString()}
                  scrollEnabled={false}
                />
              </View>

              {/* Botones de acción */}
              <View style={styles.accionesContainer}>
                <TouchableOpacity
                  style={styles.accionButton}
                  onPress={() => copiarInformacionTemplo(temploSeleccionado)}
                >
                  <Ionicons name="copy" size={20} color="#fff" />
                  <Text style={styles.accionButtonText}>Copiar Info</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.accionButton}
                  onPress={() => Alert.alert('📅 Próximo Evento', `Ver calendario de eventos del ${temploSeleccionado.nombre}`)}
                >
                  <Ionicons name="calendar" size={20} color="#fff" />
                  <Text style={styles.accionButtonText}>Ver Eventos</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        )}
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    paddingTop: 50,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
  },
  filtrosContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  busquedaInput: {
    backgroundColor: '#f8f9fa',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  filtrosScroll: {
    flexDirection: 'row',
  },
  filtroButton: {
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  filtroButtonActive: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  filtroText: {
    color: '#666',
    fontWeight: '500',
  },
  filtroTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  templosList: {
    padding: 15,
  },
  temploCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 15,
    padding: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  temploHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  temploInfo: {
    flex: 1,
  },
  temploNombre: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  temploUbicacion: {
    fontSize: 14,
    color: '#666',
  },
  copiarButton: {
    backgroundColor: '#f8f9fa',
    padding: 8,
    borderRadius: 20,
  },
  temploDescripcion: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 15,
  },
  temploStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  comentariosCount: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  comentariosCountText: {
    marginLeft: 5,
    fontSize: 14,
    color: '#666',
  },
  serviciosContainer: {
    marginBottom: 15,
  },
  serviciosTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  serviciosList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  servicioTag: {
    backgroundColor: '#e0f7fa',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginRight: 8,
    marginBottom: 5,
  },
  servicioText: {
    fontSize: 12,
    color: '#00796b',
    fontWeight: '500',
  },
  masServicios: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  proximoEvento: {
    backgroundColor: '#f0f8ff',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#667eea',
  },
  proximoEventoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  proximoEventoTexto: {
    fontSize: 14,
    color: '#333',
    marginBottom: 3,
  },
  proximoEventoFecha: {
    fontSize: 12,
    color: '#666',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    paddingTop: 50,
    backgroundColor: '#667eea',
  },
  closeButton: {
    marginRight: 15,
  },
  modalTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  temploInfoModal: {
    marginBottom: 25,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  temploUbicacionModal: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  temploDescripcionModal: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    marginBottom: 15,
  },
  temploHorarios: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  temploTelefono: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  serviciosModal: {
    marginTop: 10,
  },
  serviciosTitleModal: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  servicioItem: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  nuevoComentarioSection: {
    marginBottom: 25,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  nuevoComentarioTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  ratingInput: {
    marginBottom: 15,
  },
  ratingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  starsInput: {
    flexDirection: 'row',
  },
  comentarioInput: {
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginBottom: 15,
  },
  enviarComentarioButton: {
    backgroundColor: '#667eea',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  enviarComentarioButtonDisabled: {
    backgroundColor: '#ccc',
    opacity: 0.7,
  },
  enviarComentarioButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  comentariosSection: {
    marginBottom: 25,
  },
  comentariosTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  comentarioItem: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  comentarioHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  comentarioAutor: {
    flex: 1,
  },
  comentarioAutorNombre: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  comentarioRating: {
    flexDirection: 'row',
  },
  comentarioFecha: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  comentarioFechaTexto: {
    fontSize: 12,
    color: '#999',
    marginRight: 8,
  },
  comentarioTexto: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  accionesContainer: {
    flexDirection: 'row',
    gap: 15,
    marginTop: 20,
  },
  accionButton: {
    flex: 1,
    backgroundColor: '#667eea',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 10,
  },
  accionButtonText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 8,
  },
});
