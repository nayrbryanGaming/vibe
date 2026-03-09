import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Home from './src/screens/Home';
import ShowQR from './src/screens/ShowQR';
import Scan from './src/screens/Scan';
import ConfirmConnection from './src/screens/ConfirmConnection';
import Connections from './src/screens/Connections';
import Map from './src/screens/Map';
import CreateEvent from './src/screens/CreateEvent';

// Service Initializations
import { SyncService } from './src/blockchain/SyncService';

const Stack = createNativeStackNavigator();

function App(): JSX.Element {
  useEffect(() => {
    // Initialize Mobile-Specific Services
    try {
      SyncService.startAutoSync();
      console.log('[VIBE] Mobile services initialized.');
    } catch (e) {
      console.error('[VIBE] Service initialization error:', e);
    }
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#0A0A0A' }
        }}
      >
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="ShowQR" component={ShowQR} />
        <Stack.Screen name="Scan" component={Scan} />
        <Stack.Screen name="ConfirmConnection" component={ConfirmConnection} />
        <Stack.Screen name="Connections" component={Connections} />
        <Stack.Screen name="Map" component={Map} />
        <Stack.Screen name="CreateEvent" component={CreateEvent} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
