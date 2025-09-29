import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
  Modal,
  TextInput,
  FlatList
} from 'react-native';
import { Video } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

// Videos de templos judíos
const videosTemplos = [
  {
    id: 1,
    titulo: "Templo Beth El - Tour Virtual",
    descripcion: "Recorrido completo por el Templo Beth El en Recoleta",
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    duracion: "5:30",
    templo: "Templo Beth El",
    ubicacion: "Recoleta, CABA",
    fecha: "2024-01-15",
    vistas: 1250,
    likes: 89
  },
  {
    id: 2,
    titulo: "Servicio de Shabat en Templo Libertad",
    descripcion: "Ceremonia de Shabat con la comunidad",
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    duracion: "12:45",
    templo: "Templo Libertad",
    ubicacion: "Once, CABA",
    fecha: "2024-02-03",
    vistas: 890,
    likes: 67
  },
  {
    id: 3,
    titulo: "Historia del Templo Or Torah",
    descripcion: "Documental sobre la historia del templo",
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    duracion: "8:20",
    templo: "Templo Or Torah",
    ubicacion: "Belgrano, CABA",
    fecha: "2024-01-28",
    vistas: 2100,
    likes: 156
  },
  {
    id: 4,
    titulo: "Ceremonia de Bar Mitzvá",
    descripcion: "Celebración de Bar Mitzvá en Templo Beth Israel",
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    duracion: "15:10",
    templo: "Templo Beth Israel",
    ubicacion: "Palermo, CABA",
    fecha: "2024-02-10",
    vistas: 750,
    likes: 45
  },
  {
    id: 5,
    titulo: "Clase de Hebreo en Templo Emanuel",
    descripcion: "Lección de hebreo para principiantes",
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
    duracion: "22:30",
    templo: "Templo Emanuel",
    ubicacion: "Villa Crespo, CABA",
    fecha: "2024-02-05",
    vistas: 1800,
    likes: 134
  }
];

export default function VideosScreen() {
  const [videoSeleccionado, setVideoSeleccionado] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [videoStatus, setVideoStatus] = useState({});
  const [comentario, setComentario] = useState('');
  const [comentarios, setComentarios] = useState({});
  const [filtroTemplo, setFiltroTemplo] = useState('Todos');
  const [busqueda, setBusqueda] = useState('');

  const videoRef = useRef(null);

  // Obtener lista única de templos
  const templos = ['Todos', ...new Set(videosTemplos.map(v => v.templo))];

  // Filtrar videos
  const videosFiltrados = videosTemplos.filter(video => {
    const cumpleFiltro = filtroTemplo === 'Todos' || video.templo === filtroTemplo;
    const cumpleBusqueda = video.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
                          video.descripcion.toLowerCase().includes(busqueda.toLowerCase()) ||
                          video.templo.toLowerCase().includes(busqueda.toLowerCase());
    return cumpleFiltro && cumpleBusqueda;
  });

  const reproducirVideo = (video) => {
    setVideoSeleccionado(video);
    setModalVisible(true);
  };

  const cerrarVideo = () => {
    setModalVisible(false);
    setVideoSeleccionado(null);
  };

  const copiarInformacion = async (video) => {
    const info = `🕍 ${video.titulo}\n📍 ${video.templo} - ${video.ubicacion}\n📝 ${video.descripcion}\n⏱️ Duración: ${video.duracion}\n👀 Vistas: ${video.vistas}\n❤️ Likes: ${video.likes}`;
    
    try {
      await Clipboard.setStringAsync(info);
      Alert.alert('✅ Copiado', 'Información del video copiada al portapapeles');
    } catch (error) {
      Alert.alert('❌ Error', 'No se pudo copiar la información');
    }
  };

  const agregarComentario = () => {
    if (!comentario.trim() || !videoSeleccionado) return;

    const nuevoComentario = {
      id: Date.now(),
      texto: comentario.trim(),
      fecha: new Date().toLocaleDateString('es-ES'),
      hora: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
    };

    const videoId = videoSeleccionado.id;
    const comentariosActuales = comentarios[videoId] || [];
    setComentarios({
      ...comentarios,
      [videoId]: [...comentariosActuales, nuevoComentario]
    });
    setComentario('');
    Alert.alert('✅ Comentario agregado', 'Tu comentario ha sido guardado');
  };

  const renderVideoCard = ({ item }) => (
    <TouchableOpacity
      style={styles.videoCard}
      onPress={() => reproducirVideo(item)}
    >
      <View style={styles.videoThumbnail}>
        <Ionicons name="play-circle" size={50} color="#667eea" />
        <View style={styles.duracionBadge}>
          <Text style={styles.duracionText}>{item.duracion}</Text>
        </View>
      </View>
      
      <View style={styles.videoInfo}>
        <Text style={styles.videoTitulo}>{item.titulo}</Text>
        <Text style={styles.videoTemplo}>🕍 {item.templo}</Text>
        <Text style={styles.videoDescripcion}>{item.descripcion}</Text>
        
        <View style={styles.videoStats}>
          <View style={styles.statItem}>
            <Ionicons name="eye" size={16} color="#666" />
            <Text style={styles.statText}>{item.vistas}</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="heart" size={16} color="#e74c3c" />
            <Text style={styles.statText}>{item.likes}</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="calendar" size={16} color="#666" />
            <Text style={styles.statText}>{item.fecha}</Text>
          </View>
        </View>
      </View>
      
      <TouchableOpacity
        style={styles.copiarButton}
        onPress={() => copiarInformacion(item)}
      >
        <Ionicons name="copy" size={20} color="#667eea" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#667eea", "#764ba2"]} style={styles.header}>
        <Text style={styles.headerTitle}>🎥 Videos de Templos</Text>
        <Text style={styles.headerSubtitle}>Descubre la vida en los templos judíos</Text>
      </LinearGradient>

      {/* Filtros y búsqueda */}
      <View style={styles.filtrosContainer}>
        <TextInput
          style={styles.busquedaInput}
          placeholder="Buscar videos..."
          placeholderTextColor="#999"
          value={busqueda}
          onChangeText={setBusqueda}
        />
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtrosScroll}>
          {templos.map((templo) => (
            <TouchableOpacity
              key={templo}
              style={[
                styles.filtroButton,
                filtroTemplo === templo && styles.filtroButtonActive
              ]}
              onPress={() => setFiltroTemplo(templo)}
            >
              <Text style={[
                styles.filtroText,
                filtroTemplo === templo && styles.filtroTextActive
              ]}>
                {templo}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Lista de videos */}
      <FlatList
        data={videosFiltrados}
        renderItem={renderVideoCard}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.videosList}
        showsVerticalScrollIndicator={false}
      />

      {/* Modal de video */}
      <Modal
        animationType="slide"
        transparent={false}
        visible={modalVisible}
        onRequestClose={cerrarVideo}
      >
        {videoSeleccionado && (
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={cerrarVideo} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>{videoSeleccionado.titulo}</Text>
            </View>

            <View style={styles.videoContainer}>
              <Video
                ref={videoRef}
                style={styles.video}
                source={{ uri: videoSeleccionado.url }}
                useNativeControls
                resizeMode="contain"
                isLooping={false}
                onPlaybackStatusUpdate={status => setVideoStatus(() => status)}
              />
            </View>

            <ScrollView style={styles.modalContent}>
              <View style={styles.videoDetails}>
                <Text style={styles.videoTemploModal}>🕍 {videoSeleccionado.templo}</Text>
                <Text style={styles.videoUbicacion}>📍 {videoSeleccionado.ubicacion}</Text>
                <Text style={styles.videoDescripcionModal}>{videoSeleccionado.descripcion}</Text>
                
                <View style={styles.videoStatsModal}>
                  <View style={styles.statItemModal}>
                    <Ionicons name="eye" size={18} color="#667eea" />
                    <Text style={styles.statTextModal}>{videoSeleccionado.vistas} vistas</Text>
                  </View>
                  <View style={styles.statItemModal}>
                    <Ionicons name="heart" size={18} color="#e74c3c" />
                    <Text style={styles.statTextModal}>{videoSeleccionado.likes} likes</Text>
                  </View>
                  <View style={styles.statItemModal}>
                    <Ionicons name="time" size={18} color="#667eea" />
                    <Text style={styles.statTextModal}>{videoSeleccionado.duracion}</Text>
                  </View>
                </View>
              </View>

              {/* Comentarios */}
              <View style={styles.comentariosSection}>
                <Text style={styles.comentariosTitle}>💬 Comentarios</Text>
                
                <View style={styles.agregarComentario}>
                  <TextInput
                    style={styles.comentarioInput}
                    placeholder="Agrega un comentario..."
                    placeholderTextColor="#999"
                    value={comentario}
                    onChangeText={setComentario}
                    multiline
                  />
                  <TouchableOpacity
                    style={styles.enviarComentarioButton}
                    onPress={agregarComentario}
                  >
                    <Ionicons name="send" size={20} color="#fff" />
                  </TouchableOpacity>
                </View>

                <View style={styles.comentariosList}>
                  {(comentarios[videoSeleccionado.id] || []).map((comentario) => (
                    <View key={comentario.id} style={styles.comentarioItem}>
                      <View style={styles.comentarioHeader}>
                        <Text style={styles.comentarioFecha}>{comentario.fecha} {comentario.hora}</Text>
                      </View>
                      <Text style={styles.comentarioTexto}>{comentario.texto}</Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* Botones de acción */}
              <View style={styles.accionesContainer}>
                <TouchableOpacity
                  style={styles.accionButton}
                  onPress={() => copiarInformacion(videoSeleccionado)}
                >
                  <Ionicons name="copy" size={20} color="#fff" />
                  <Text style={styles.accionButtonText}>Copiar Info</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.accionButton}
                  onPress={() => Alert.alert('📅 Próximo Evento', 'Ver calendario de eventos del templo')}
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
  videosList: {
    padding: 15,
  },
  videoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 15,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  videoThumbnail: {
    height: 200,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  duracionBadge: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  duracionText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  videoInfo: {
    padding: 15,
  },
  videoTitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  videoTemplo: {
    fontSize: 14,
    color: '#667eea',
    fontWeight: '600',
    marginBottom: 8,
  },
  videoDescripcion: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  videoStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    marginLeft: 5,
    fontSize: 12,
    color: '#666',
  },
  copiarButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    backgroundColor: 'rgba(255,255,255,0.9)',
    padding: 8,
    borderRadius: 20,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    paddingTop: 50,
    backgroundColor: 'rgba(0,0,0,0.8)',
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
  videoContainer: {
    height: height * 0.3,
    backgroundColor: '#000',
  },
  video: {
    flex: 1,
  },
  modalContent: {
    flex: 1,
    backgroundColor: '#fff',
  },
  videoDetails: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  videoTemploModal: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#667eea',
    marginBottom: 5,
  },
  videoUbicacion: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  videoDescripcionModal: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    marginBottom: 15,
  },
  videoStatsModal: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItemModal: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statTextModal: {
    marginLeft: 5,
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  comentariosSection: {
    padding: 20,
  },
  comentariosTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  agregarComentario: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  comentarioInput: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    maxHeight: 100,
  },
  enviarComentarioButton: {
    backgroundColor: '#667eea',
    padding: 12,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  comentariosList: {
    marginTop: 10,
  },
  comentarioItem: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  comentarioHeader: {
    marginBottom: 5,
  },
  comentarioFecha: {
    fontSize: 12,
    color: '#999',
  },
  comentarioTexto: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  accionesContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 15,
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
