import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ScrollView, TextInput, Linking, Alert, Animated, Modal } from "react-native";
import MapView, { Marker, Polyline } from "react-native-web-maps";
import { LinearGradient } from "expo-linear-gradient";
import * as Location from "expo-location";
import { Ionicons } from "@expo/vector-icons";
import { PanGestureHandler, State, GestureHandlerRootView } from "react-native-gesture-handler";
import { Video } from "expo-av";
import * as Clipboard from "expo-clipboard";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width } = Dimensions.get("window");

// ⚡ API Key de Google Maps configurada para Routes API
const GOOGLE_PLACES_API_KEY = "AIzaSyByB84CazRGsic_hFM4aVRXUdvTQreBvr8";
const GOOGLE_DIRECTIONS_API_KEY = "AIzaSyByB84CazRGsic_hFM4aVRXUdvTQreBvr8";
const GOOGLE_ROUTES_API_KEY = "AIzaSyByB84CazRGsic_hFM4aVRXUdvTQreBvr8";

export default function MapaScreen() {
  const [userLocation, setUserLocation] = useState({
    latitude: -34.6037,
    longitude: -58.3816,
  });
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [googlePlaces, setGooglePlaces] = useState([]);
  const [mapRef, setMapRef] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredPlaces, setFilteredPlaces] = useState([]);
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [routeInfo, setRouteInfo] = useState(null);
  const [showRoute, setShowRoute] = useState(false);
  const [selectedTransportMode, setSelectedTransportMode] = useState('driving');
  const [showRouteInfo, setShowRouteInfo] = useState(false);
  const [realTimeUpdates, setRealTimeUpdates] = useState(false);
  const [routeUpdateInterval, setRouteUpdateInterval] = useState(null);
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);
  const [panelAnimation] = useState(new Animated.Value(50)); 
  const transportModes = [
    {
      id: 'driving',
      name: 'Auto',
      icon: '🚗',
      color: '#4285F4',
      apiMode: 'driving'
    },
    {
      id: 'transit',
      name: 'Colectivo',
      icon: '🚌',
      color: '#34A853',
      apiMode: 'transit'
    },
    {
      id: 'walking',
      name: 'Caminando',
      icon: '🚶',
      color: '#FBBC04',
      apiMode: 'walking'
    },
    {
      id: 'bicycling',
      name: 'Bicicleta',
      icon: '🚴',
      color: '#EA4335',
      apiMode: 'bicycling'
    }
  ];

  // Templos judíos con información completa
  const templosJudios = [
    {
      id: 1,
      name: "Templo Beth El",
      address: "Recoleta 3456, CABA",
      rating: 4.9,
      distance: "1.8 km",
      coordinates: { latitude: -34.5887, longitude: -58.3926 },
      description: "Templo judío con servicios religiosos y eventos comunitarios",
      hours: "Servicios: Vie 19:00, Sáb 10:00",
      phone: "+54 11 5678-9012",
      image: "🕍",
      type: "templo",
      video: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
      servicios: ["Shabat", "Bar/Bat Mitzvá", "Clases de Hebreo", "Eventos Comunitarios"],
      proximoEvento: {
        fecha: "2025-03-15",
        titulo: "Servicio de Shabat Especial",
        descripcion: "Servicio de Shabat con música en vivo"
      },
      comentarios: []
    },
    {
      id: 2,
      name: "Templo Libertad",
      address: "Once 2345, CABA",
      rating: 4.6,
      distance: "2.1 km",
      coordinates: { latitude: -34.6087, longitude: -58.4056 },
      description: "Templo histórico en el barrio de Once",
      hours: "Servicios: Vie 18:30, Sáb 9:30",
      phone: "+54 11 4567-8901",
      image: "🕍",
      type: "templo",
      video: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
      servicios: ["Shabat", "Festividades", "Educación", "Actividades Sociales"],
      proximoEvento: {
        fecha: "2025-03-20",
        titulo: "Conferencia sobre Historia Judía",
        descripcion: "Charla sobre la historia de la comunidad judía en Argentina"
      },
      comentarios: []
    },
    {
      id: 3,
      name: "Templo Or Torah",
      address: "Belgrano 6789, CABA",
      rating: 4.9,
      distance: "2.3 km",
      coordinates: { latitude: -34.6147, longitude: -58.4026 },
      description: "Templo moderno con amplias instalaciones",
      hours: "Servicios: Vie 19:15, Sáb 10:15",
      phone: "+54 11 3456-7890",
      image: "🕍",
      type: "templo",
      video: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
      servicios: ["Shabat", "Bar/Bat Mitzvá", "Clases de Torá", "Grupos Juveniles"],
      proximoEvento: {
        fecha: "2025-03-18",
        titulo: "Cena Comunitaria de Purim",
        descripcion: "Cena especial para celebrar Purim con toda la comunidad"
      },
      comentarios: []
    },
    {
      id: 4,
      name: "Templo Beth Israel",
      address: "Palermo 5678, CABA",
      rating: 4.7,
      distance: "1.9 km",
      coordinates: { latitude: -34.5827, longitude: -58.4316 },
      description: "Templo con enfoque en la juventud y familias",
      hours: "Servicios: Vie 18:45, Sáb 9:45",
      phone: "+54 11 2345-6789",
      image: "🕍",
      type: "templo",
      video: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
      servicios: ["Shabat", "Bar/Bat Mitzvá", "Programas Juveniles", "Actividades Familiares"],
      proximoEvento: {
        fecha: "2025-03-22",
        titulo: "Taller de Cocina Kosher",
        descripcion: "Aprende a preparar platos tradicionales kosher"
      },
      comentarios: []
    },
    {
      id: 5,
      name: "Templo Emanuel",
      address: "Villa Crespo 4567, CABA",
      rating: 4.5,
      distance: "2.5 km",
      coordinates: { latitude: -34.5967, longitude: -58.4367 },
      description: "Templo con tradición y modernidad",
      hours: "Servicios: Vie 19:00, Sáb 10:00",
      phone: "+54 11 1234-5678",
      image: "🕍",
      type: "templo",
      video: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
      servicios: ["Shabat", "Festividades", "Educación Adulta", "Servicios Sociales"],
      proximoEvento: {
        fecha: "2025-03-25",
        titulo: "Concierto de Música Klezmer",
        descripcion: "Espectáculo de música tradicional judía"
      },
      comentarios: []
    }
  ];

  // Obtener ubicación y cargar datos de Google Places
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;

      let current = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      setUserLocation({
        latitude: current.coords.latitude,
        longitude: current.coords.longitude,
      });
    })();

    // Buscar lugares kosher cercanos usando Places API
    searchNearbyKosherPlaces();
    
    // Inicializar lista filtrada con todos los templos
    setFilteredPlaces(templosJudios);
  }, []);

  // Cleanup effect para detener actualizaciones en tiempo real
  useEffect(() => {
    return () => {
      if (routeUpdateInterval) {
        clearInterval(routeUpdateInterval);
      }
    };
  }, [routeUpdateInterval]);

  // Función para buscar lugares kosher cercanos usando Google Places API
  const searchNearbyKosherPlaces = async () => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${userLocation.latitude},${userLocation.longitude}&radius=5000&keyword=kosher&type=restaurant|food|store&key=${GOOGLE_PLACES_API_KEY}`
      );
      const data = await response.json();
      
      if (data.results && data.results.length > 0) {
        const places = data.results.map(place => ({
          id: `google_${place.place_id}`,
          name: place.name,
          address: place.vicinity,
          rating: place.rating || 0,
          coordinates: {
            latitude: place.geometry.location.lat,
            longitude: place.geometry.location.lng
          },
          description: "Lugar kosher encontrado en Google Places",
          image: "📍",
          type: "google_place",
          place_id: place.place_id
        }));
        setGooglePlaces(places);
      }
    } catch (error) {
      console.error('Error buscando lugares kosher:', error);
    }
  };

  // Función para filtrar templos según búsqueda
  const filterPlaces = (query) => {
    if (!query.trim()) {
      setFilteredPlaces([...templosJudios, ...googlePlaces]);
      return;
    }
    
    const allPlaces = [...templosJudios, ...googlePlaces];
    const filtered = allPlaces.filter(place => 
      place.name.toLowerCase().includes(query.toLowerCase()) ||
      place.address.toLowerCase().includes(query.toLowerCase()) ||
      place.type.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredPlaces(filtered);
  };

  // Función para buscar lugares por texto usando Google Places API
  const searchPlacesByText = async (query) => {
    if (!query.trim()) return;
    
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query + ' kosher')}&location=${userLocation.latitude},${userLocation.longitude}&radius=10000&key=${GOOGLE_PLACES_API_KEY}`
      );
      const data = await response.json();
      
      if (data.results && data.results.length > 0) {
        const places = data.results.map(place => ({
          id: `search_${place.place_id}`,
          name: place.name,
          address: place.formatted_address,
          rating: place.rating || 0,
          coordinates: {
            latitude: place.geometry.location.lat,
            longitude: place.geometry.location.lng
          },
          description: "Resultado de búsqueda en Google Places",
          image: "🔍",
          type: "search_result",
          place_id: place.place_id
        }));
        
        // Combinar con templos locales y filtrar
        const allPlaces = [...templosJudios, ...googlePlaces, ...places];
        const filtered = allPlaces.filter(place => 
          place.name.toLowerCase().includes(query.toLowerCase()) ||
          place.address.toLowerCase().includes(query.toLowerCase()) ||
          place.type.toLowerCase().includes(query.toLowerCase())
        );
        setFilteredPlaces(filtered);
      }
    } catch (error) {
      console.error('Error buscando lugares:', error);
    }
  };



  // Función para buscar lugares por texto
  const searchPlaces = async (query) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&location=${userLocation.latitude},${userLocation.longitude}&radius=5000&key=${GOOGLE_PLACES_API_KEY}`
      );
      const data = await response.json();
      
      if (data.results && data.results.length > 0) {
        return data.results;
      }
      return [];
    } catch (error) {
      console.error('Error buscando lugares:', error);
      return [];
    }
  };

  // Función mejorada para obtener direcciones con datos en tiempo real
  const getDirections = async (destination) => {
    const origin = `${userLocation.latitude},${userLocation.longitude}`;
    const dest = `${destination.coordinates.latitude},${destination.coordinates.longitude}`;
    
    try {
      const mode = transportModes.find(m => m.id === selectedTransportMode);
      const currentTime = Math.floor(Date.now() / 1000);
      
      // Construir URL con parámetros avanzados para datos en tiempo real
      let url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${dest}&mode=${mode.apiMode}&key=${GOOGLE_ROUTES_API_KEY}`;
      
      // Agregar parámetros para datos en tiempo real
      url += `&departure_time=${currentTime}`;
      url += `&traffic_model=best_guess`;
      url += `&alternatives=true`;
      url += `&avoid=tolls`;
      
      // Parámetros específicos para transporte público
      if (mode.apiMode === 'transit') {
        url += `&transit_mode=bus|subway|train|tram`;
        url += `&transit_routing_preference=fewer_transfers`;
      }
      
      // Parámetros específicos para conducción
      if (mode.apiMode === 'driving') {
        url += `&avoid=highways`;
      }
      
      console.log('🚗 Obteniendo ruta en tiempo real:', url);
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.status === 'OK' && data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        const leg = route.legs[0];
        
        // Decodificar polilínea con mayor precisión
        const routeCoords = decodePolyline(route.overview_polyline.points);
        setRouteCoordinates(routeCoords);
        
        // Información detallada de la ruta
        const routeDetails = {
          distance: leg.distance.text,
          duration: leg.duration.text,
          durationInTraffic: leg.duration_in_traffic ? leg.duration_in_traffic.text : leg.duration.text,
          destination: destination.name,
          mode: mode,
          startAddress: leg.start_address,
          endAddress: leg.end_address,
          steps: leg.steps,
          trafficInfo: leg.duration_in_traffic ? {
            hasTraffic: true,
            trafficDelay: leg.duration_in_traffic.value - leg.duration.value
          } : { hasTraffic: false },
          alternatives: data.routes.length > 1 ? data.routes.slice(1) : []
        };
        
        setRouteInfo(routeDetails);
        setShowRoute(true);
        setShowRouteInfo(true);
        
        // Iniciar actualizaciones en tiempo real
        startRealTimeUpdates(destination);
        
        // Ajustar el mapa para mostrar la ruta completa en el espacio disponible (estilo Google Maps)
        if (mapRef && routeCoords.length > 0) {
          setTimeout(() => {
            // Calcular límites de la ruta
            const bounds = getRouteBounds(routeCoords);
            
            // Ajustar el mapa considerando el panel inferior
            // Dejar más espacio para ver rutas largas completamente
            mapRef.fitToCoordinates(routeCoords, {
              edgePadding: { 
                top: 80,     // Más espacio superior
                right: 30, 
                bottom: 500, // Más espacio para el panel y rutas largas
                left: 30 
              },
              animated: true,
            });
            
            // Asegurar que la ruta se vea completa en el espacio disponible
            setTimeout(() => {
              // Calcular una región que muestre la ruta completa considerando el panel
              const adjustedBounds = {
                latitude: bounds.latitude,
                longitude: bounds.longitude,
                latitudeDelta: bounds.latitudeDelta * 1.2, // Aumentar un poco para mejor vista
                longitudeDelta: bounds.longitudeDelta * 1.2,
              };
              
              mapRef.animateToRegion(adjustedBounds, 1000);
            }, 300);
          }, 200);
        }
        
        console.log('✅ Ruta obtenida exitosamente:', routeDetails);
        
      } else {
        console.error('❌ Error en la API:', data.error_message || data.status);
        Alert.alert(
          '❌ Sin ruta disponible',
          `No se pudo encontrar una ruta para ${mode.name}. ${data.error_message || 'Intenta con otro medio de transporte.'}`,
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('❌ Error obteniendo direcciones:', error);
      Alert.alert('❌ Error de conexión', 'No se pudieron obtener las direcciones. Verifica tu conexión a internet.');
    }
  };

  // Función para testear la API de Directions
  const testDirectionsAPI = async () => {
    try {
      const testOrigin = `${userLocation.latitude},${userLocation.longitude}`;
      const testDest = `-34.6118,-58.3960`; // Puerto Madero
      const testUrl = `https://maps.googleapis.com/maps/api/directions/json?origin=${testOrigin}&destination=${testDest}&mode=driving&key=${GOOGLE_DIRECTIONS_API_KEY}`;
      
      console.log('🧪 Testing API:', testUrl);
      const response = await fetch(testUrl);
      const data = await response.json();
      
      console.log('🧪 API Test Result:', data.status);
      if (data.error_message) {
        console.log('🧪 API Error:', data.error_message);
      }
      
      return data.status === 'OK';
    } catch (error) {
      console.error('🧪 API Test Error:', error);
      return false;
    }
  };

  // Función para decodificar polilínea de Google Maps
  const decodePolyline = (encoded) => {
    const poly = [];
    let index = 0;
    const len = encoded.length;
    let lat = 0;
    let lng = 0;

    while (index < len) {
      let b, shift = 0, result = 0;
      do {
        b = encoded.charAt(index++).charCodeAt(0) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      const dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
      lat += dlat;

      shift = 0;
      result = 0;
      do {
        b = encoded.charAt(index++).charCodeAt(0) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      const dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
      lng += dlng;

      poly.push({
        latitude: lat / 1e5,
        longitude: lng / 1e5,
      });
    }
    return poly;
  };

  // Función para obtener los límites de la ruta
  const getRouteBounds = (coordinates) => {
    let minLat = coordinates[0].latitude;
    let maxLat = coordinates[0].latitude;
    let minLng = coordinates[0].longitude;
    let maxLng = coordinates[0].longitude;

    coordinates.forEach(coord => {
      minLat = Math.min(minLat, coord.latitude);
      maxLat = Math.max(maxLat, coord.latitude);
      minLng = Math.min(minLng, coord.longitude);
      maxLng = Math.max(maxLng, coord.longitude);
    });

    return {
      latitude: (minLat + maxLat) / 2,
      longitude: (minLng + maxLng) / 2,
      latitudeDelta: maxLat - minLat + 0.01,
      longitudeDelta: maxLng - minLng + 0.01,
    };
  };

  // Función para cambiar modo de transporte
  const changeTransportMode = (modeId) => {
    setSelectedTransportMode(modeId);
    
    // Si hay una ruta activa, recalcular con el nuevo modo
    if (showRoute && selectedPlace) {
      getDirections(selectedPlace);
    }
  };

  // Función para actualizar rutas en tiempo real
  const startRealTimeUpdates = (destination) => {
    if (routeUpdateInterval) {
      clearInterval(routeUpdateInterval);
    }
    
    const interval = setInterval(() => {
      if (destination && showRoute) {
        console.log('🔄 Actualizando ruta en tiempo real...');
        getDirections(destination);
      }
    }, 30000); // Actualizar cada 30 segundos
    
    setRouteUpdateInterval(interval);
    setRealTimeUpdates(true);
  };

  // Función para detener actualizaciones en tiempo real
  const stopRealTimeUpdates = () => {
    if (routeUpdateInterval) {
      clearInterval(routeUpdateInterval);
      setRouteUpdateInterval(null);
    }
    setRealTimeUpdates(false);
  };

  // Función para manejar el gesto de deslizar el panel (movimiento libre)
  const onPanGestureEvent = Animated.event(
    [{ nativeEvent: { translationY: panelAnimation } }],
    { 
      useNativeDriver: false,
      listener: (event) => {
        const { translationY } = event.nativeEvent;
        // Solo limitar el movimiento hacia arriba (no puede ir más arriba de 0)
        // Permitir movimiento libre hacia abajo
        if (translationY < 0) {
          panelAnimation.setValue(0); // No permitir movimiento hacia arriba
        }
        // No hay límite hacia abajo, el panel puede ir tan abajo como quieras
      }
    }
  );

  const onPanHandlerStateChange = (event) => {
    if (event.nativeEvent.state === State.END) {
      const { translationY } = event.nativeEvent;
      
      // El panel se queda donde lo dejes, sin volver automáticamente
      // Solo limitamos el movimiento hacia arriba (no puede ir más arriba de 0)
      const finalValue = Math.max(0, translationY);
      
      // Actualizar el estado basado en la posición final
      if (finalValue > 100) {
        setIsPanelCollapsed(true);
      } else {
        setIsPanelCollapsed(false);
      }
      
      // El panel se queda en la posición donde lo soltaste
      panelAnimation.setValue(finalValue);
      
      // Ajustar el mapa basado en la nueva posición del panel
      setTimeout(() => {
        const panelHeight = Math.max(200, Math.min(500, finalValue + 200));
        adjustMapForPanel(panelHeight);
      }, 100);
    }
  };

  // Función para ajustar el mapa cuando cambia el panel
  const adjustMapForPanel = (panelHeight) => {
    if (mapRef && routeCoordinates.length > 0) {
      const bounds = getRouteBounds(routeCoordinates);
      
      // Ajustar el mapa considerando la altura del panel con más espacio
      mapRef.fitToCoordinates(routeCoordinates, {
        edgePadding: { 
          top: 80,     // Más espacio superior
          right: 30, 
          bottom: Math.max(500, panelHeight + 50), // Más espacio para rutas largas
          left: 30 
        },
        animated: true,
      });
    }
  };

  // Función para alternar el estado del panel
  const togglePanel = () => {
    if (isPanelCollapsed) {
      Animated.timing(panelAnimation, {
        toValue: 50, // Posición inicial más abajo para ver la ruta
        duration: 300,
        useNativeDriver: false,
      }).start();
      setIsPanelCollapsed(false);
      // Ajustar mapa para panel expandido
      setTimeout(() => adjustMapForPanel(500), 350);
    } else {
      Animated.timing(panelAnimation, {
        toValue: 150, // Valor para colapsar más
        duration: 300,
        useNativeDriver: false,
      }).start();
      setIsPanelCollapsed(true);
      // Ajustar mapa para panel colapsado
      setTimeout(() => adjustMapForPanel(200), 350);
    }
  };

  // Función para limpiar la ruta
  const clearRoute = () => {
    stopRealTimeUpdates();
    setRouteCoordinates([]);
    setRouteInfo(null);
    setShowRoute(false);
    setShowRouteInfo(false);
    setSelectedPlace(null);
    setIsPanelCollapsed(false);
    panelAnimation.setValue(50); // Posición inicial más abajo
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      {/* Header simplificado */}
      <LinearGradient colors={["#667eea", "#764ba2"]} style={styles.header}>
        <Text style={styles.headerTitle}>🕍 Templos Judíos</Text>
        <Text style={styles.headerSubtitle}>Descubre templos y eventos cercanos</Text>
      </LinearGradient>

      {/* Mapa con buscador integrado */}
      <View style={styles.mapContainer}>
        <MapView
          ref={(ref) => setMapRef(ref)}
          style={styles.map}
          initialRegion={{
            latitude: userLocation.latitude,
            longitude: userLocation.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
          showsUserLocation={true}
        >
          {/* Marcador de origen cuando hay ruta activa */}
          {showRoute && (
            <Marker
              coordinate={userLocation}
              title="Mi ubicación"
              description="Punto de partida"
            >
              <View style={[styles.customMarker, styles.originMarker]}>
                <Text style={styles.markerEmoji}>📍</Text>
              </View>
            </Marker>
          )}

          {/* Marcadores de todos los templos */}
          {[...templosJudios, ...googlePlaces].map((place) => (
            <Marker
              key={place.id}
              coordinate={place.coordinates}
              title={place.name}
              description={place.address}
              onPress={() => setSelectedPlace(place)}
            >
              <View style={[
                styles.customMarker,
                showRoute && routeInfo?.destination === place.name && styles.destinationMarker
              ]}>
                <Text style={styles.markerEmoji}>{place.image}</Text>
              </View>
            </Marker>
          ))}
          
          {/* Ruta de direcciones */}
          {showRoute && routeCoordinates.length > 0 && (
            <Polyline
              coordinates={routeCoordinates}
              strokeColor={routeInfo?.mode?.color || "#4285F4"}
              strokeWidth={selectedTransportMode === 'walking' ? 3 : selectedTransportMode === 'bicycling' ? 3 : 5}
              lineDashPattern={
                selectedTransportMode === 'walking' ? [8, 4] :
                selectedTransportMode === 'bicycling' ? [12, 6] :
                selectedTransportMode === 'transit' ? [15, 8, 5, 8] : 
                [1]
              }
            />
          )}
        </MapView>
        
        {/* Barra de búsqueda flotante sobre el mapa */}
        <View style={styles.floatingSearchContainer}>
          <TextInput
            style={styles.floatingSearchInput}
            placeholder="Buscar templos judíos..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={(text) => {
              setSearchQuery(text);
              filterPlaces(text);
            }}
          />
          <TouchableOpacity 
            style={styles.floatingSearchButton}
            onPress={() => searchPlacesByText(searchQuery)}
          >
            <Ionicons name="search" size={20} color="#667eea" />
          </TouchableOpacity>
        </View>

      </View>

      {/* Panel de información de ruta deslizable */}
      {showRouteInfo && routeInfo && (
        <PanGestureHandler
          onGestureEvent={onPanGestureEvent}
          onHandlerStateChange={onPanHandlerStateChange}
        >
          <Animated.View 
            style={[
              styles.transportRoutePanel,
              {
                transform: [{ translateY: panelAnimation }]
              }
            ]}
          >
            <ScrollView 
              style={styles.panelScrollView}
              showsVerticalScrollIndicator={true}
              nestedScrollEnabled={true}
              contentContainerStyle={styles.scrollContentContainer}
              bounces={true}
              scrollEnabled={true}
            >
            {/* Indicador de deslizar */}
            <View style={styles.dragIndicator}>
              <View style={styles.dragHandle} />
            </View>

            {/* Header del panel con información de tráfico */}
            <View style={styles.transportHeader}>
              <TouchableOpacity 
                style={styles.backButton}
                onPress={() => {
                  setShowRouteInfo(false);
                  setRouteCoordinates([]);
                  setRouteInfo(null);
                  setShowRoute(false);
                  stopRealTimeUpdates();
                }}
              >
                <Ionicons name="arrow-back" size={20} color="#6B7280" />
                <Text style={styles.backButtonText}>Lugares</Text>
              </TouchableOpacity>
              <View style={styles.transportTitleContainer}>
                <Text style={styles.transportTitle}>Ruta en tiempo real</Text>
                {realTimeUpdates && (
                  <View style={styles.liveIndicator}>
                    <View style={styles.liveDot} />
                    <Text style={styles.liveText}>EN VIVO</Text>
                  </View>
                )}
              </View>
              <View style={styles.transportHeaderButtons}>
                <TouchableOpacity 
                  style={styles.refreshButton}
                  onPress={() => routeInfo && getDirections({ coordinates: routeInfo.destination })}
                >
                  <Ionicons name="refresh" size={20} color="#6B7280" />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.collapseButton}
                  onPress={togglePanel}
                >
                  <Ionicons 
                    name={isPanelCollapsed ? "chevron-up" : "chevron-down"} 
                    size={20} 
                    color="#6B7280" 
                  />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.closeButton}
                  onPress={clearRoute}
                >
                  <Ionicons name="close" size={20} color="#6B7280" />
                </TouchableOpacity>
              </View>
            </View>


          {/* Botones de tipo de transporte fijos - siempre visibles */}
          <View style={styles.transportButtonsContainer}>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={true}
              style={styles.transportButtonsRow}
              contentContainerStyle={styles.transportButtonsContent}
              bounces={false}
            >
              {transportModes.map((mode) => {
                const getDurationForMode = (modeId) => {
                  switch(modeId) {
                    case 'walking': return '35 min';
                    case 'driving': return '25 min';
                    case 'transit': return '28 min';
                    case 'bicycling': return '22 min';
                    default: return '25 min';
                  }
                };
                
                return (
                  <TouchableOpacity
                    key={mode.id}
                    style={[
                      styles.transportButton,
                      selectedTransportMode === mode.id && styles.transportButtonSelected
                    ]}
                    onPress={() => changeTransportMode(mode.id)}
                  >
                    <Text style={styles.transportButtonIcon}>{mode.icon}</Text>
                    <Text style={[
                      styles.transportButtonText,
                      selectedTransportMode === mode.id && styles.transportButtonTextSelected
                    ]}>
                      {mode.name}
                    </Text>
                    <Text style={[
                      styles.transportButtonDuration,
                      selectedTransportMode === mode.id && styles.transportButtonDurationSelected
                    ]}>
                      {getDurationForMode(mode.id)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Información compacta del vehículo seleccionado */}
          <View style={styles.routeDetails}>
            {selectedTransportMode === 'driving' && (
              <View style={styles.routeCard}>
                <View style={styles.routeSteps}>
                  <View style={styles.routeStep}>
                    <View style={styles.stepIcon}>
                      <Text style={styles.stepIconText}>🚗</Text>
                    </View>
                    <Text style={styles.stepDuration}>
                      {routeInfo.durationInTraffic || routeInfo.duration}
                    </Text>
                  </View>
                </View>
                <View style={styles.routeSummary}>
                  <Text style={styles.totalTime}>
                    {routeInfo.durationInTraffic || routeInfo.duration}
                  </Text>
                  {routeInfo.trafficInfo.hasTraffic && (
                    <Text style={styles.trafficDelay}>
                      +{Math.round(routeInfo.trafficInfo.trafficDelay / 60)} min tráfico
                    </Text>
                  )}
                </View>
                <View style={styles.routeTiming}>
                  <Text style={styles.routeTimingText}>
                    {new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })} - 
                    {new Date(Date.now() + (routeInfo.trafficInfo.hasTraffic ? routeInfo.trafficInfo.trafficDelay : 0) * 1000).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })} • {routeInfo.distance}
                  </Text>
                  <Text style={styles.routeDetailText}>
                    {routeInfo.trafficInfo.hasTraffic ? 'Ruta con tráfico en tiempo real' : 'Ruta sin tráfico'}
                  </Text>
                </View>
              </View>
            )}

            {selectedTransportMode === 'transit' && (
              <View style={styles.routeCard}>
                <View style={styles.routeSteps}>
                  <View style={styles.routeStep}>
                    <View style={styles.stepIcon}>
                      <Text style={styles.stepIconText}>🚶</Text>
                    </View>
                    <Text style={styles.stepDuration}>8</Text>
                  </View>
                  <View style={styles.routeArrow}>
                    <Text style={styles.arrowText}>→</Text>
                  </View>
                  <View style={styles.routeStep}>
                    <View style={styles.stepIcon}>
                      <Text style={styles.stepIconText}>🚌</Text>
                    </View>
                    <Text style={styles.stepDuration}>15A</Text>
                  </View>
                  <View style={styles.routeArrow}>
                    <Text style={styles.arrowText}>→</Text>
                  </View>
                  <View style={styles.routeStep}>
                    <View style={styles.stepIcon}>
                      <Text style={styles.stepIconText}>🚶</Text>
                    </View>
                    <Text style={styles.stepDuration}>9</Text>
                  </View>
                </View>
                <View style={styles.routeSummary}>
                  <Text style={styles.totalTime}>
                    {routeInfo.durationInTraffic || routeInfo.duration}
                  </Text>
                </View>
                <View style={styles.routeTiming}>
                  <Text style={styles.routeTimingText}>
                    {new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })} - 
                    {new Date(Date.now() + (routeInfo.trafficInfo.hasTraffic ? routeInfo.trafficInfo.trafficDelay : 0) * 1000).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })} • {routeInfo.distance}
                  </Text>
                  <Text style={styles.routeDetailText}>
                    Horario programado: próximas salidas desde parada cercana
                  </Text>
                </View>
              </View>
            )}

            {selectedTransportMode === 'walking' && (
              <View style={styles.routeCard}>
                <View style={styles.routeSteps}>
                  <View style={styles.routeStep}>
                    <View style={styles.stepIcon}>
                      <Text style={styles.stepIconText}>🚶</Text>
                    </View>
                    <Text style={styles.stepDuration}>
                      {routeInfo.durationInTraffic || routeInfo.duration}
                    </Text>
                  </View>
                </View>
                <View style={styles.routeSummary}>
                  <Text style={styles.totalTime}>
                    {routeInfo.durationInTraffic || routeInfo.duration}
                  </Text>
                </View>
                <View style={styles.routeTiming}>
                  <Text style={styles.routeTimingText}>
                    {new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })} - 
                    {new Date(Date.now() + (routeInfo.trafficInfo.hasTraffic ? routeInfo.trafficInfo.trafficDelay : 0) * 1000).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })} • {routeInfo.distance}
                  </Text>
                  <Text style={styles.routeDetailText}>
                    Ruta peatonal directa por calles principales
                  </Text>
                </View>
              </View>
            )}

            {selectedTransportMode === 'bicycling' && (
              <View style={styles.routeCard}>
                <View style={styles.routeSteps}>
                  <View style={styles.routeStep}>
                    <View style={styles.stepIcon}>
                      <Text style={styles.stepIconText}>🚴</Text>
                    </View>
                    <Text style={styles.stepDuration}>
                      {routeInfo.durationInTraffic || routeInfo.duration}
                    </Text>
                  </View>
                </View>
                <View style={styles.routeSummary}>
                  <Text style={styles.totalTime}>
                    {routeInfo.durationInTraffic || routeInfo.duration}
                  </Text>
                </View>
                <View style={styles.routeTiming}>
                  <Text style={styles.routeTimingText}>
                    {new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })} - 
                    {new Date(Date.now() + (routeInfo.trafficInfo.hasTraffic ? routeInfo.trafficInfo.trafficDelay : 0) * 1000).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })} • {routeInfo.distance}
                  </Text>
                  <Text style={styles.routeDetailText}>
                    Ruta ciclovía por parques y calles seguras
                  </Text>
                </View>
              </View>
            )}
          </View>

          {/* Información adicional de la ruta cuando no está colapsado */}
          {!isPanelCollapsed && (
            <View style={styles.additionalRouteInfo}>
              <View style={styles.routeSummaryCard}>
                <Text style={styles.summaryTitle}>Resumen de la ruta</Text>
                <View style={styles.summaryRow}>
                  <Ionicons name="location" size={16} color="#6B7280" />
                  <Text style={styles.summaryText}>Desde: {routeInfo.startAddress}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Ionicons name="flag" size={16} color="#6B7280" />
                  <Text style={styles.summaryText}>Hasta: {routeInfo.endAddress}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Ionicons name="time" size={16} color="#6B7280" />
                  <Text style={styles.summaryText}>
                    Tiempo total: {routeInfo.durationInTraffic || routeInfo.duration}
                  </Text>
                </View>
                <View style={styles.summaryRow}>
                  <Ionicons name="speedometer" size={16} color="#6B7280" />
                  <Text style={styles.summaryText}>Distancia: {routeInfo.distance}</Text>
                </View>
                {routeInfo.trafficInfo.hasTraffic && (
                  <View style={styles.summaryRow}>
                    <Ionicons name="warning" size={16} color="#EF4444" />
                    <Text style={[styles.summaryText, { color: "#EF4444" }]}>
                      Retraso por tráfico: +{Math.round(routeInfo.trafficInfo.trafficDelay / 60)} min
                    </Text>
                  </View>
                )}
              </View>
            </View>
            )}
            </ScrollView>
          </Animated.View>
        </PanGestureHandler>
      )}

      {/* Lista de resultados de búsqueda - Solo mostrar cuando hay búsqueda activa y no hay ruta */}
      {!showRouteInfo && searchQuery && (
        <ScrollView style={styles.searchResultsList}>
          <Text style={styles.sectionTitle}>
            🔍 Resultados de búsqueda ({filteredPlaces.length})
          </Text>
          
          {filteredPlaces.map((place) => (
            <TouchableOpacity
              key={place.id}
              style={styles.placeCard}
              onPress={() => {
                // Centrar el mapa en el lugar seleccionado
                if (mapRef && place.coordinates) {
                  mapRef.animateToRegion({
                    latitude: place.coordinates.latitude,
                    longitude: place.coordinates.longitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                  }, 1000);
                }
                // Mostrar el modal con opciones
                setSelectedPlace(place);
              }}
            >
              <Text style={styles.placeName}>{place.image} {place.name}</Text>
              <Text style={styles.placeInfo}>{place.address}</Text>
              <Text style={styles.placeInfo}>
                ⭐ {place.rating} {place.distance && `• ${place.distance}`}
              </Text>
              <Text style={styles.placeType}>{place.type}</Text>
            </TouchableOpacity>
          ))}
          
          {filteredPlaces.length === 0 && (
            <View style={styles.noResults}>
              <Text style={styles.noResultsText}>No se encontraron lugares con "{searchQuery}"</Text>
              <TouchableOpacity 
                style={styles.clearSearchButton}
                onPress={() => {
                  setSearchQuery('');
                  setFilteredPlaces([]);
                }}
              >
                <Text style={styles.clearSearchText}>Limpiar búsqueda</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      )}

      {/* Modal de detalles del templo */}
      {selectedPlace && (
        <Modal
          animationType="slide"
          transparent={false}
          visible={!!selectedPlace}
          onRequestClose={() => setSelectedPlace(null)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setSelectedPlace(null)} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>{selectedPlace.name}</Text>
            </View>

            <ScrollView style={styles.modalContent}>
              {/* Información básica */}
              <View style={styles.temploInfo}>
                <Text style={styles.temploDescripcion}>{selectedPlace.description}</Text>
                <Text style={styles.temploUbicacion}>📍 {selectedPlace.address}</Text>
                {selectedPlace.hours && <Text style={styles.temploHorarios}>⏰ {selectedPlace.hours}</Text>}
                {selectedPlace.phone && <Text style={styles.temploTelefono}>📞 {selectedPlace.phone}</Text>}
                {selectedPlace.rating && <Text style={styles.temploRating}>⭐ {selectedPlace.rating}/5</Text>}
              </View>

              {/* Video del templo */}
              {selectedPlace.video && (
                <View style={styles.videoSection}>
                  <Text style={styles.sectionTitle}>🎥 Video del Templo</Text>
                  <Video
                    style={styles.videoPlayer}
                    source={{ uri: selectedPlace.video }}
                    useNativeControls
                    resizeMode="contain"
                    isLooping={false}
                  />
                </View>
              )}

              {/* Servicios */}
              {selectedPlace.servicios && (
                <View style={styles.serviciosSection}>
                  <Text style={styles.sectionTitle}>🛠️ Servicios</Text>
                  {selectedPlace.servicios.map((servicio, index) => (
                    <View key={index} style={styles.servicioItem}>
                      <Text style={styles.servicioText}>• {servicio}</Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Próximo evento */}
              {selectedPlace.proximoEvento && (
                <View style={styles.eventoSection}>
                  <Text style={styles.sectionTitle}>📅 Próximo Evento</Text>
                  <View style={styles.eventoCard}>
                    <Text style={styles.eventoTitulo}>{selectedPlace.proximoEvento.titulo}</Text>
                    <Text style={styles.eventoFecha}>📅 {selectedPlace.proximoEvento.fecha}</Text>
                    <Text style={styles.eventoDescripcion}>{selectedPlace.proximoEvento.descripcion}</Text>
                  </View>
                </View>
              )}

              {/* Comentarios */}
              <View style={styles.comentariosSection}>
                <Text style={styles.sectionTitle}>💬 Comentarios</Text>
                {selectedPlace.comentarios && selectedPlace.comentarios.length > 0 ? (
                  selectedPlace.comentarios.map((comentario, index) => (
                    <View key={index} style={styles.comentarioItem}>
                      <Text style={styles.comentarioTexto}>{comentario}</Text>
                    </View>
                  ))
                ) : (
                  <Text style={styles.sinComentarios}>Aún no hay comentarios para este templo</Text>
                )}
              </View>

              {/* Botones de acción */}
              <View style={styles.accionesContainer}>
                <TouchableOpacity
                  style={styles.accionButton}
                  onPress={() => {
                    getDirections(selectedPlace);
                    setSelectedPlace(null);
                  }}
                >
                  <Ionicons name="navigate" size={20} color="#fff" />
                  <Text style={styles.accionButtonText}>Como llegar</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.accionButton}
                  onPress={async () => {
                    const info = `🕍 ${selectedPlace.name}\n📍 ${selectedPlace.address}\n📝 ${selectedPlace.description}\n⏰ ${selectedPlace.hours}\n📞 ${selectedPlace.phone}\n⭐ ${selectedPlace.rating}/5`;
                    try {
                      await Clipboard.setStringAsync(info);
                      Alert.alert('✅ Copiado', 'Información del templo copiada al portapapeles');
                    } catch (error) {
                      Alert.alert('❌ Error', 'No se pudo copiar la información');
                    }
                  }}
                >
                  <Ionicons name="copy" size={20} color="#fff" />
                  <Text style={styles.accionButtonText}>Copiar Info</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.accionButton}
                  onPress={() => Alert.alert('📅 Ver Calendario', 'Ver todos los eventos del templo en el calendario')}
                >
                  <Ionicons name="calendar" size={20} color="#fff" />
                  <Text style={styles.accionButtonText}>Ver Eventos</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </Modal>
      )}
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa" },
  header: { padding: 15, alignItems: "center" },
  headerTitle: { fontSize: 20, fontWeight: "bold", color: "#fff" },
  headerSubtitle: { fontSize: 12, color: "#fff", marginTop: 3 },
  mapContainer: { 
    flex: 1, 
    position: "relative" 
  },
  map: { 
    flex: 1 
  },
  floatingSearchContainer: {
    position: "absolute",
    top: 15,
    left: 15,
    right: 15,
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 8,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  floatingSearchInput: {
    flex: 1,
    fontSize: 16,
    color: "#333",
    paddingVertical: 5,
  },
  floatingSearchButton: {
    padding: 5,
    marginLeft: 10,
  },
  testApiButton: {
    position: "absolute",
    top: 70,
    right: 15,
    backgroundColor: "#FF6B6B",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  testApiButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  placesList: { 
    flex: 1, 
    padding: 15, 
    backgroundColor: "#fff",
    paddingBottom: 50,
  },
  searchResultsList: { 
    flex: 1, 
    padding: 15, 
    backgroundColor: "#fff",
    paddingBottom: 50,
  },
  routesList: {
    maxHeight: 250,
  },
  transportButtonsContainer: {
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  transportButtonsRow: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  transportButtonsContent: {
    paddingRight: 20,
  },
  transportButton: {
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginRight: 6,
    borderRadius: 10,
    backgroundColor: "#f8f9fa",
    borderWidth: 2,
    borderColor: "transparent",
    minWidth: 70,
  },
  transportButtonSelected: {
    backgroundColor: "#e0f2fe",
    borderColor: "#0891b2",
    borderBottomWidth: 3,
    borderBottomColor: "#0891b2",
  },
  transportButtonIcon: {
    fontSize: 16,
    marginBottom: 4,
  },
  transportButtonText: {
    fontSize: 10,
    fontWeight: "500",
    color: "#6B7280",
    marginBottom: 1,
  },
  transportButtonTextSelected: {
    color: "#0891b2",
    fontWeight: "600",
  },
  transportButtonDuration: {
    fontSize: 8,
    color: "#9CA3AF",
    fontWeight: "400",
  },
  transportButtonDurationSelected: {
    color: "#0891b2",
    fontWeight: "600",
  },
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  placeCard: {
    backgroundColor: "#f1f1f1",
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
  },
  placeName: { fontSize: 16, fontWeight: "600" },
  placeInfo: { fontSize: 13, color: "#555" },
  placeType: { fontSize: 12, color: "#888", fontStyle: "italic", marginTop: 2 },
  customMarker: {
    backgroundColor: "#fff",
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#667eea",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  markerEmoji: { fontSize: 20 },
  originMarker: {
    backgroundColor: "#10B981",
    borderColor: "#059669",
  },
  destinationMarker: {
    backgroundColor: "#EF4444",
    borderColor: "#DC2626",
  },
  noResults: {
    alignItems: "center",
    padding: 20,
  },
  noResultsText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 15,
  },
  clearSearchButton: {
    backgroundColor: "#667eea",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  clearSearchText: {
    color: "#fff",
    fontWeight: "600",
  },
  modal: {
    position: "absolute",
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center", alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    width: width - 60,
  },
  modalTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
  modalButtons: {
    flexDirection: "row",
    marginTop: 15,
    gap: 8,
    flexWrap: "wrap",
  },
  googleMapsButton: {
    flex: 1,
    backgroundColor: "#4285F4",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    minWidth: 100,
  },
  directionsButton: {
    flex: 2,
    backgroundColor: "#34A853",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    minWidth: 150,
    marginRight: 10,
  },
  directionsButtonText: { 
    color: "#fff", 
    fontWeight: "600",
    fontSize: 14,
  },
  clearRouteButton: {
    flex: 1,
    backgroundColor: "#EF4444",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    minWidth: 100,
  },
  clearRouteButtonText: { 
    color: "#fff", 
    fontWeight: "600",
    fontSize: 12,
  },
  closeButton: {
    flex: 1,
    backgroundColor: "#6B7280",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    minWidth: 100,
  },
  closeButtonText: { 
    color: "#fff", 
    fontWeight: "600",
    fontSize: 12,
  },
  // Estilos para el panel de transporte público
  transportRoutePanel: {
    backgroundColor: "#fff",
    marginHorizontal: 0,
    marginVertical: 0,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: 450, // Aumentado para permitir más scroll
  },
  dragIndicator: {
    alignItems: "center",
    paddingVertical: 8,
    paddingBottom: 4,
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: "#D1D5DB",
    borderRadius: 2,
  },
  panelScrollView: {
    height: 400, // Altura fija para asegurar scroll
  },
  scrollContentContainer: {
    flexGrow: 1,
    paddingBottom: 50, // Más padding para asegurar que se vea todo
    minHeight: 500, // Altura mínima aumentada para forzar scroll
  },
  transportHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    paddingBottom: 10,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: "#6B7280",
    marginLeft: 4,
    fontWeight: "500",
  },
  transportTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
  },
  transportHeaderButtons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
  },
  filterButton: {
    padding: 8,
  },
  collapseButton: {
    padding: 8,
  },
  closeButton: {
    padding: 8,
  },
  transportModesRow: {
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
  transportModeTab: {
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginRight: 8,
    borderRadius: 12,
    backgroundColor: "#f8f9fa",
    borderWidth: 2,
    borderColor: "transparent",
    minWidth: 80,
  },
  transportModeTabSelected: {
    backgroundColor: "#e0f2fe",
    borderColor: "#0891b2",
    borderBottomWidth: 3,
    borderBottomColor: "#0891b2",
  },
  transportModeDuration: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
    marginBottom: 4,
  },
  transportModeIcon: {
    fontSize: 16,
  },
  routeDetails: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  compactRouteCard: {
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    padding: 12,
  },
  compactRouteInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  compactTime: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1F2937",
  },
  compactDistance: {
    fontSize: 14,
    color: "#6B7280",
  },
  compactTraffic: {
    fontSize: 12,
    color: "#EF4444",
    fontWeight: "600",
  },
  compactDetail: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  routeControls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  refreshButton: {
    padding: 8,
  },
  timeSelector: {
    backgroundColor: "#f8f9fa",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  timeSelectorText: {
    fontSize: 14,
    color: "#6B7280",
  },
  transportSelector: {
    backgroundColor: "#f8f9fa",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  transportSelectorText: {
    fontSize: 14,
    color: "#6B7280",
  },
  routeCard: {
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
  },
  routeSteps: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  routeStep: {
    alignItems: "center",
    marginHorizontal: 8,
  },
  stepIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  stepIconText: {
    fontSize: 18,
  },
  stepDuration: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
  },
  routeArrow: {
    marginHorizontal: 4,
  },
  arrowText: {
    fontSize: 16,
    color: "#6B7280",
    fontWeight: "bold",
  },
  routeSummary: {
    alignItems: "center",
    marginBottom: 8,
  },
  totalTime: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1F2937",
  },
  routeTiming: {
    alignItems: "center",
  },
  routeTimingText: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 4,
  },
  routeDetailText: {
    fontSize: 12,
    color: "#9CA3AF",
    textAlign: "center",
  },
  // Estilos para información adicional de la ruta
  additionalRouteInfo: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  routeSummaryCard: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 15,
    marginTop: 10,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 14,
    color: "#6B7280",
    marginLeft: 8,
    flex: 1,
  },
  // Estilos para el modal del templo
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
  modalContent: {
    flex: 1,
    padding: 20,
  },
  temploInfo: {
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  temploDescripcion: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    marginBottom: 10,
  },
  temploUbicacion: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  temploHorarios: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  temploTelefono: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  temploRating: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  videoSection: {
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  videoPlayer: {
    height: 200,
    backgroundColor: '#000',
    borderRadius: 10,
  },
  serviciosSection: {
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  servicioItem: {
    marginBottom: 8,
  },
  servicioText: {
    fontSize: 14,
    color: '#666',
  },
  eventoSection: {
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  eventoCard: {
    backgroundColor: '#f0f8ff',
    padding: 15,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#667eea',
  },
  eventoTitulo: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  eventoFecha: {
    fontSize: 14,
    color: '#667eea',
    marginBottom: 8,
  },
  eventoDescripcion: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  comentariosSection: {
    marginBottom: 20,
  },
  comentarioItem: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  comentarioTexto: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  sinComentarios: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 20,
  },
  accionesContainer: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
  },
  accionButton: {
    flex: 1,
    backgroundColor: '#667eea',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
  },
  accionButtonText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 5,
    fontSize: 12,
  },
});
