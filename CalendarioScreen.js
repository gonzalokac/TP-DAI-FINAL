// screens/CalendarioScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  StyleSheet,
  Dimensions,
  Modal
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

export default function CalendarioScreen() {
  const [fechaActual, setFechaActual] = useState(new Date());
  const [eventosGuardados, setEventosGuardados] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMesVisible, setModalMesVisible] = useState(false);
  const [fechaSeleccionada, setFechaSeleccionada] = useState('');
  const [textoEvento, setTextoEvento] = useState('');
  const [eventosModal, setEventosModal] = useState([]);
  const [inputAnio, setInputAnio] = useState(String(new Date().getFullYear()));
  const [inputMes, setInputMes] = useState(String(new Date().getMonth() + 1));

  // Eventos fijos del calendario hebreo
  const eventosFijos = {
    "2025-03-14": [{ texto: "Purim", color: "green" }],
    "2025-03-15": [{ texto: "Servicio de Shabat Especial - Templo Beth El", color: "blue" }],
    "2025-03-17": [{ texto: "Día de la Memoria por Embajada de Israel", color: "green" }],
    "2025-03-18": [{ texto: "Cena Comunitaria de Purim - Templo Or Torah", color: "blue" }],
    "2025-03-20": [{ texto: "Conferencia sobre Historia Judía - Templo Libertad", color: "blue" }],
    "2025-03-22": [{ texto: "Taller de Cocina Kosher - Templo Beth Israel", color: "blue" }],
    "2025-03-25": [{ texto: "Concierto de Música Klezmer - Templo Emanuel", color: "blue" }],
    "2025-04-12": [{ texto: "Víspera de Pesaj", color: "red" }],
    "2025-04-13": [{ texto: "Primer día de Pesaj", color: "red" }],
    "2025-04-14": [{ texto: "Segundo día de Pesaj", color: "red" }],
    "2025-04-19": [{ texto: "Séptimo día de Pesaj", color: "red" }],
    "2025-04-20": [{ texto: "Octavo día de Pesaj", color: "red" }],
    "2025-04-24": [{ texto: "Iom Hashoa", color: "green" }],
    "2025-04-30": [{ texto: "Iom Hazikarón", color: "green" }],
    "2025-05-01": [{ texto: "Iom Haatzmaut", color: "green" }],
    "2025-05-16": [{ texto: "Lag Baomer", color: "green" }],
    "2025-06-01": [{ texto: "Víspera de Shavuot", color: "red" }],
    "2025-06-02": [{ texto: "Primer día de Shavuot", color: "red" }],
    "2025-06-03": [{ texto: "Segundo día de Shavuot", color: "red" }],
    "2025-07-18": [{ texto: "Día de Solidaridad AMIA", color: "green" }],
    "2025-09-22": [{ texto: "Víspera de Rosh Hashaná", color: "red" }],
    "2025-09-23": [{ texto: "Primer día de Rosh Hashaná", color: "red" }],
    "2025-09-24": [{ texto: "Segundo día de Rosh Hashaná", color: "red" }],
    "2025-10-01": [{ texto: "Víspera de Iom Kipur", color: "red" }],
    "2025-10-02": [{ texto: "Iom Kipur", color: "red" }],
    "2025-10-06": [{ texto: "Víspera de Sucot", color: "red" }],
    "2025-10-07": [
      { texto: "Primer día de Sucot", color: "red" },
      { texto: "Recuerdo a secuestrados por Hamas", color: "green" }
    ],
    "2025-10-08": [{ texto: "Segundo día de Sucot", color: "red" }],
    "2025-10-13": [{ texto: "Hoshana Rabá", color: "red" }],
    "2025-10-14": [{ texto: "Shminí Atzeret", color: "red" }],
    "2025-10-15": [{ texto: "Simjat Torá", color: "red" }],
    "2025-11-04": [{ texto: "Conmemoración Itzjak Rabin", color: "green" }],
    "2025-12-14": [{ texto: "Janucá - Día 1", color: "green" }],
    "2025-12-15": [{ texto: "Janucá - Día 2", color: "green" }],
    "2025-12-16": [{ texto: "Janucá - Día 3", color: "green" }],
    "2025-12-17": [{ texto: "Janucá - Día 4", color: "green" }],
    "2025-12-18": [{ texto: "Janucá - Día 5", color: "green" }],
    "2025-12-19": [{ texto: "Janucá - Día 6", color: "green" }],
    "2025-12-20": [{ texto: "Janucá - Día 7", color: "green" }],
    "2025-12-21": [{ texto: "Janucá - Día 8", color: "green" }],
    "2025-12-22": [{ texto: "Janucá - Encendido final", color: "green" }]
  };

  useEffect(() => {
    cargarEventosGuardados();
  }, []);

  // Sincronizar inputs cuando cambie la fecha actual
  useEffect(() => {
    setInputAnio(String(fechaActual.getFullYear()));
    setInputMes(String(fechaActual.getMonth() + 1));
  }, [fechaActual]);

  const cargarEventosGuardados = async () => {
    try {
      const eventos = await AsyncStorage.getItem('eventos');
      if (eventos) {
        setEventosGuardados(JSON.parse(eventos));
      }
    } catch (error) {
      console.error('Error al cargar eventos:', error);
    }
  };

  const guardarEvento = async () => {
    if (!fechaSeleccionada || !textoEvento.trim()) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    try {
      const nuevosEventos = { ...eventosGuardados };
      if (!nuevosEventos[fechaSeleccionada]) {
        nuevosEventos[fechaSeleccionada] = [];
      }
      nuevosEventos[fechaSeleccionada].push(textoEvento.trim());
      
      await AsyncStorage.setItem('eventos', JSON.stringify(nuevosEventos));
      setEventosGuardados(nuevosEventos);
      setTextoEvento('');
      setModalVisible(false);
      Alert.alert('Éxito', 'Evento agregado correctamente');
    } catch (error) {
      console.error('Error al guardar evento:', error);
      Alert.alert('Error', 'No se pudo guardar el evento');
    }
  };

  const cambiarMes = (direccion) => {
    const nuevaFecha = new Date(fechaActual);
    nuevaFecha.setMonth(nuevaFecha.getMonth() + direccion);
    setFechaActual(nuevaFecha);
    // Sincronizar los inputs
    setInputAnio(String(nuevaFecha.getFullYear()));
    setInputMes(String(nuevaFecha.getMonth() + 1));
  };

  const seleccionarMes = (mes) => {
    const nuevaFecha = new Date(fechaActual);
    nuevaFecha.setMonth(mes - 1);
    setFechaActual(nuevaFecha);
    setInputMes(String(mes));
  };

  const obtenerNombreMes = (fecha) => {
    const meses = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return meses[fecha.getMonth()];
  };

  const generarCalendario = () => {
    const mes = fechaActual.getMonth();
    const anio = fechaActual.getFullYear();
    const diasMes = new Date(anio, mes + 1, 0).getDate();
    const primerDia = new Date(anio, mes, 1).getDay();
    
    // Ajustar para que la semana empiece en lunes (0 = domingo, 1 = lunes, etc.)
    let diaSemana = primerDia === 0 ? 6 : primerDia - 1;
    
    const dias = [];
    
    // Agregar celdas vacías para alinear el primer día
    for (let i = 0; i < diaSemana; i++) {
      dias.push({ dia: '', vacio: true });
    }
    
    // Agregar los días del mes
    for (let dia = 1; dia <= diasMes; dia++) {
      const fechaStr = `${anio}-${String(mes + 1).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
      const eventos = [
        ...(eventosFijos[fechaStr] || []),
        ...(eventosGuardados[fechaStr]?.map(e => ({ texto: e, color: "blue" })) || [])
      ];
      
      dias.push({
        dia,
        fecha: fechaStr,
        eventos,
        vacio: false
      });
    }
    
    // Completar la última semana si es necesario
    const diasRestantes = 7 - (dias.length % 7);
    if (diasRestantes < 7) {
      for (let i = 0; i < diasRestantes; i++) {
        dias.push({ dia: '', vacio: true });
      }
    }
    
    return dias;
  };

  const mostrarEventos = (fecha, eventos) => {
    if (eventos.length === 0) {
      Alert.alert('Sin eventos', 'Esta fecha no tiene eventos programados');
      return;
    }
    
    setFechaSeleccionada(fecha);
    setEventosModal(eventos);
    setModalVisible(true);
  };

  const obtenerColorEvento = (color) => {
    switch (color) {
      case 'green': return '#4CAF50';
      case 'red': return '#F44336';
      case 'blue': return '#2196F3';
      default: return '#757575';
    }
  };

  const obtenerTipoEvento = (color) => {
    switch (color) {
      case 'green': return 'Conmemoración';
      case 'red': return 'Feriado';
      case 'blue': return 'Evento de Templo';
      default: return 'Evento';
    }
  };

  const renderizarDia = (item, index) => {
    if (item.vacio) {
      return <View key={index} style={styles.diaVacio} />;
    }

    // Determinar si es el primer día de la semana (índice 0, 7, 14, etc.)
    const esPrimerDiaSemana = index % 7 === 0;
    const tieneEventos = item.eventos.length > 0;

  return (
      <TouchableOpacity
        key={index}
        style={[
          styles.dia,
          esPrimerDiaSemana && { borderLeftWidth: 1, borderLeftColor: '#e0e0e0' },
          tieneEventos && styles.diaConEventos
        ]}
        onPress={() => mostrarEventos(item.fecha, item.eventos)}
      >
        <Text style={[
          styles.numeroDia,
          tieneEventos && styles.numeroDiaConEventos
        ]}>
          {item.dia}
        </Text>
        {tieneEventos && (
          <View style={styles.indicadoresContainer}>
            {item.eventos.slice(0, 3).map((evento, idx) => (
              <View
                key={idx}
                style={[
                  styles.indicadorEvento,
                  { backgroundColor: obtenerColorEvento(evento.color) }
                ]}
              />
            ))}
            {item.eventos.length > 3 && (
              <Text style={styles.masEventos}>+{item.eventos.length - 3}</Text>
            )}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const dias = generarCalendario();
  const semanas = [];
  for (let i = 0; i < dias.length; i += 7) {
    semanas.push(dias.slice(i, i + 7));
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={true}>
      <Text style={styles.title}>📅 Calendario Hebreo</Text>
      <Text style={styles.subtitle}>Eventos importantes y fechas conmemorativas</Text>
      
      {/* Selector de año y mes */}
      <View style={styles.selectorFecha}>
        <Text style={styles.selectorTitulo}>📅 Seleccionar Fecha Específica</Text>
        <View style={styles.inputsContainer}>
          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>Año:</Text>
            <TextInput
              style={styles.inputAnioMes}
              placeholder="2025"
              value={inputAnio}
              onChangeText={(text) => {
                setInputAnio(text);
                const anio = parseInt(text);
                if (anio >= 1900 && anio <= 2100) {
                  const nuevaFecha = new Date(fechaActual);
                  nuevaFecha.setFullYear(anio);
                  setFechaActual(nuevaFecha);
                }
              }}
              keyboardType="numeric"
              maxLength={4}
            />
          </View>
          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>Mes:</Text>
            <TouchableOpacity
              style={styles.selectorMes}
              onPress={() => setModalMesVisible(true)}
            >
              <Text style={styles.textoSelectorMes}>
                {obtenerNombreMes(new Date(2025, parseInt(inputMes) - 1, 1))}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      
      {/* Navegación del mes */}
      <View style={styles.navegacionMes}>
        <TouchableOpacity style={styles.botonNavegacion} onPress={() => cambiarMes(-1)}>
          <Text style={styles.textoBoton}>◀</Text>
        </TouchableOpacity>
        <Text style={styles.mesActual}>
          {obtenerNombreMes(fechaActual)} {fechaActual.getFullYear()}
        </Text>
        <TouchableOpacity style={styles.botonNavegacion} onPress={() => cambiarMes(1)}>
          <Text style={styles.textoBoton}>▶</Text>
        </TouchableOpacity>
      </View>

      {/* Calendario */}
      <View style={styles.calendarioContainer}>
        {/* Encabezados de días */}
        <View style={styles.encabezados}>
          {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(dia => (
            <Text key={dia} style={styles.encabezadoDia}>{dia}</Text>
          ))}
        </View>
        
        {/* Semanas */}
        {semanas.map((semana, semanaIndex) => (
          <View 
            key={semanaIndex} 
            style={[
              styles.semana,
              semanaIndex === 0 && { borderTopWidth: 1, borderTopColor: '#e0e0e0' }
            ]}
          >
            {semana.map((dia, diaIndex) => renderizarDia(dia, semanaIndex * 7 + diaIndex))}
          </View>
        ))}
        
        {/* Mensaje informativo */}
        <View style={styles.mensajeInfo}>
          <Text style={styles.textoMensajeInfo}>
            💡 Toca cualquier día para ver los eventos o agregar nuevos
          </Text>
        </View>
        
        {/* Indicador de scroll */}
        <View style={styles.indicadorScroll}>
          <Text style={styles.textoIndicadorScroll}>
            ⬇️ Desliza hacia abajo para agregar eventos
          </Text>
        </View>
      </View>

      {/* Formulario para agregar eventos */}
      <View style={styles.formularioContainer}>
        <Text style={styles.formularioTitulo}>📝 Agregar Nuevo Evento</Text>
        <Text style={styles.formularioDescripcion}>
          Completa los campos para agregar un evento personalizado
        </Text>
        <TextInput
          style={styles.inputFecha}
          placeholder="Fecha (YYYY-MM-DD)"
          value={fechaSeleccionada}
          onChangeText={setFechaSeleccionada}
          keyboardType="numeric"
        />
        <TextInput
          style={styles.inputEvento}
          placeholder="Descripción del evento"
          value={textoEvento}
          onChangeText={setTextoEvento}
          multiline
        />
        <TouchableOpacity 
          style={[
            styles.botonAgregar,
            (!fechaSeleccionada || !textoEvento.trim()) && styles.botonDeshabilitado
          ]} 
          onPress={guardarEvento}
          disabled={!fechaSeleccionada || !textoEvento.trim()}
        >
          <Text style={styles.textoBotonAgregar}>✅ Agregar Evento</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.botonLimpiar} 
          onPress={() => {
            setFechaSeleccionada('');
            setTextoEvento('');
          }}
        >
          <Text style={styles.textoBotonLimpiar}>🗑️ Limpiar Formulario</Text>
        </TouchableOpacity>
      </View>

      {/* Leyenda */}
      <View style={styles.leyenda}>
        <Text style={styles.leyendaTitulo}>Leyenda:</Text>
        <View style={styles.leyendaItem}>
          <View style={[styles.indicadorLeyenda, { backgroundColor: '#4CAF50' }]} />
          <Text style={styles.textoLeyenda}>Conmemoraciones</Text>
        </View>
        <View style={styles.leyendaItem}>
          <View style={[styles.indicadorLeyenda, { backgroundColor: '#F44336' }]} />
          <Text style={styles.textoLeyenda}>Feriados</Text>
        </View>
        <View style={styles.leyendaItem}>
          <View style={[styles.indicadorLeyenda, { backgroundColor: '#2196F3' }]} />
          <Text style={styles.textoLeyenda}>Eventos de templos</Text>
        </View>
      </View>


      {/* Modal para mostrar eventos */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitulo}>📅 {fechaSeleccionada}</Text>
            <Text style={styles.modalSubtitulo}>
              {eventosModal.length} evento{eventosModal.length !== 1 ? 's' : ''} programado{eventosModal.length !== 1 ? 's' : ''}
            </Text>
            <ScrollView style={styles.modalEventos}>
              {eventosModal.map((evento, index) => (
                <View key={index} style={styles.eventoModal}>
                  <View style={styles.eventoHeader}>
                    <View
                      style={[
                        styles.indicadorEventoModal,
                        { backgroundColor: obtenerColorEvento(evento.color) }
                      ]}
                    />
                    <Text style={styles.tipoEvento}>{obtenerTipoEvento(evento.color)}</Text>
                  </View>
                  <Text style={styles.textoEventoModal}>{evento.texto}</Text>
                </View>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.botonCerrar}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.textoBotonCerrar}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal para seleccionar mes */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalMesVisible}
        onRequestClose={() => setModalMesVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitulo}>📅 Seleccionar Mes</Text>
            <ScrollView style={styles.modalMeses}>
              {[
                { numero: 1, nombre: 'Enero' },
                { numero: 2, nombre: 'Febrero' },
                { numero: 3, nombre: 'Marzo' },
                { numero: 4, nombre: 'Abril' },
                { numero: 5, nombre: 'Mayo' },
                { numero: 6, nombre: 'Junio' },
                { numero: 7, nombre: 'Julio' },
                { numero: 8, nombre: 'Agosto' },
                { numero: 9, nombre: 'Septiembre' },
                { numero: 10, nombre: 'Octubre' },
                { numero: 11, nombre: 'Noviembre' },
                { numero: 12, nombre: 'Diciembre' }
              ].map((mes) => (
                <TouchableOpacity
                  key={mes.numero}
                  style={[
                    styles.opcionMes,
                    parseInt(inputMes) === mes.numero && styles.opcionMesSeleccionada
                  ]}
                  onPress={() => {
                    seleccionarMes(mes.numero);
                    setModalMesVisible(false);
                  }}
                >
                  <Text style={[
                    styles.textoOpcionMes,
                    parseInt(inputMes) === mes.numero && styles.textoOpcionMesSeleccionada
                  ]}>
                    {mes.nombre}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.botonCerrar}
              onPress={() => setModalMesVisible(false)}
            >
              <Text style={styles.textoBotonCerrar}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
    paddingBottom: 32, // Agregar padding inferior para mejor scroll
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
  },
  selectorFecha: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  selectorTitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
    textAlign: 'center',
  },
  inputsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  inputWrapper: {
    flex: 1,
    marginHorizontal: 5,
  },
  inputLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
    textAlign: 'center',
  },
  inputAnioMes: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '600',
    color: '#333',
  },
  selectorMes: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '600',
    color: '#333',
    backgroundColor: '#f0f0f0',
  },
  textoSelectorMes: {
    color: '#333',
  },
  navegacionMes: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  botonNavegacion: {
    width: 40,
    height: 40,
    backgroundColor: '#2196F3',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textoBoton: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  mesActual: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  calendarioContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    minHeight: 400,
  },
  encabezados: {
    flexDirection: 'row',
    marginBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: '#e0e0e0',
    paddingBottom: 8,
  },
  encabezadoDia: {
    flex: 1,
    textAlign: 'center',
    fontWeight: '600',
    color: '#333',
    fontSize: 14,
  },
  semana: {
    flexDirection: 'row',
    marginBottom: 1,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  dia: {
    flex: 1,
    aspectRatio: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: '#e0e0e0',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#fff',
    padding: 8,
    minHeight: 60,
  },
  diaVacio: {
    flex: 1,
    aspectRatio: 1,
    borderRightWidth: 1,
    borderRightColor: '#e0e0e0',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#f9f9f9',
    minHeight: 60,
  },
  numeroDia: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
    textAlign: 'center',
  },
  numeroDiaConEventos: {
    color: '#2196F3', // Color para días con eventos
  },
  diaConEventos: {
    backgroundColor: '#e0f7fa', // Color de fondo para días con eventos
  },
  indicadoresContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: 2,
  },
  indicadorEvento: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 1,
    marginVertical: 1,
  },
  masEventos: {
    fontSize: 10,
    color: '#666',
    marginLeft: 4,
    fontWeight: '500',
  },
  formularioContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  formularioTitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  formularioDescripcion: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    textAlign: 'center',
  },
  inputFecha: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '600',
    color: '#333',
  },
  inputEvento: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
    color: '#333',
  },
  botonAgregar: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  botonDeshabilitado: {
    backgroundColor: '#ccc',
    opacity: 0.7,
  },
  textoBotonAgregar: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  botonLimpiar: {
    backgroundColor: '#F44336',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  textoBotonLimpiar: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  leyenda: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  leyendaTitulo: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  leyendaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  indicadorLeyenda: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  textoLeyenda: {
    fontSize: 14,
    color: '#666',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: width * 0.9,
    maxHeight: '80%',
  },
  modalTitulo: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  modalSubtitulo: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
  },
  modalEventos: {
    maxHeight: 300,
  },
  eventoModal: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  eventoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  indicadorEventoModal: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  tipoEvento: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  textoEventoModal: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  botonCerrar: {
    backgroundColor: '#666',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  textoBotonCerrar: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  mensajeInfo: {
    backgroundColor: '#e0f7fa',
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#b2ebf2',
  },
  textoMensajeInfo: {
    fontSize: 14,
    color: '#00796b',
    fontWeight: '500',
  },
  indicadorScroll: {
    alignItems: 'center',
    paddingVertical: 10,
    backgroundColor: '#e0f7fa',
    borderTopWidth: 1,
    borderTopColor: '#b2ebf2',
  },
  textoIndicadorScroll: {
    fontSize: 14,
    color: '#00796b',
    fontWeight: '500',
  },
  mensajeAyuda: {
    backgroundColor: '#e0f7fa',
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#b2ebf2',
  },
  textoMensajeAyuda: {
    fontSize: 14,
    color: '#00796b',
    fontWeight: '500',
  },
  modalMeses: {
    maxHeight: 300,
  },
  opcionMes: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  opcionMesSeleccionada: {
    backgroundColor: '#e0f7fa',
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  textoOpcionMes: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  textoOpcionMesSeleccionada: {
    color: '#2196F3',
  },
});
