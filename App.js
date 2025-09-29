import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

// Importar las pantallas
import MapaScreen from './MapaScreen';
import CalendarioScreen from './CalendarioScreen';
import VideosScreen from './VideosScreen';
import ComentariosScreen from './ComentariosScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === 'Mapa') {
              iconName = focused ? 'map' : 'map-outline';
            } else if (route.name === 'Calendario') {
              iconName = focused ? 'calendar' : 'calendar-outline';
            } else if (route.name === 'Videos') {
              iconName = focused ? 'play-circle' : 'play-circle-outline';
            } else if (route.name === 'Comentarios') {
              iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#667eea',
          tabBarInactiveTintColor: 'gray',
          headerStyle: {
            backgroundColor: '#667eea',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        })}
      >
        <Tab.Screen 
          name="Mapa" 
          component={MapaScreen}
          options={{ title: '🕍 Templos Judíos' }}
        />
        <Tab.Screen 
          name="Calendario" 
          component={CalendarioScreen}
          options={{ title: '📅 Eventos' }}
        />
        <Tab.Screen 
          name="Videos" 
          component={VideosScreen}
          options={{ title: '🎥 Videos' }}
        />
        <Tab.Screen 
          name="Comentarios" 
          component={ComentariosScreen}
          options={{ title: '💬 Comentarios' }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
