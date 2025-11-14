import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LocationContext = createContext(undefined);

export const LocationProvider = ({ children }) => {
        const [address, set_address] = useState({
                street: '',
                city: '',
                state: '',
                zip_code: '',
                country: 'México',
        });

        useEffect(() => {
                load_address();
        }, []);

        useEffect(() => {
                save_address();
        }, [address]);

        const load_address = async () => {
                try {
                        const address_data = await AsyncStorage.getItem('address');
                        if (address_data) {
                                set_address(JSON.parse(address_data));
                        }
                } catch (error) {
                        console.error('Error al cargar dirección:', error);
                }
        };

        const save_address = async () => {
                try {
                        await AsyncStorage.setItem('address', JSON.stringify(address));
                } catch (error) {
                        console.error('Error al guardar dirección:', error);
                }
        };

        const update_address = (new_address) => {
                set_address({ ...address, ...new_address });
        };

        return (
                <LocationContext.Provider value={{ address, update_address }}>
                        {children}
                </LocationContext.Provider>
        );
};

export const useLocation = () => {
        const context = useContext(LocationContext);
        if (context === undefined) {
                throw new Error('useLocation debe ser usado dentro de LocationProvider');
        }
        return context;
};
