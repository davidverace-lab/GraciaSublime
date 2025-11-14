import React, { createContext, useState, useContext, useEffect } from 'react';
import {
        getUserAddresses,
        createAddress,
        updateAddress,
        deleteAddress,
} from '../services/addressesService';
import { useAuth } from './AuthContext';

const AddressesContext = createContext(undefined);

export const AddressesProvider = ({ children }) => {
        const { user, is_authenticated } = useAuth();
        const [addresses, set_addresses] = useState([]);
        const [loading, set_loading] = useState(false);
        const [default_address, set_default_address] = useState(null);

        // Cargar direcciones cuando el usuario se autentique
        useEffect(() => {
                if (is_authenticated && user?.id) {
                        load_addresses();
                } else {
                        set_addresses([]);
                        set_default_address(null);
                }
        }, [is_authenticated, user?.id]);

        const load_addresses = async () => {
                try {
                        set_loading(true);
                        const { data, error } = await getUserAddresses(user.id);
                        if (error) throw error;
                        set_addresses(data || []);

                        // Establecer la primera dirección como predeterminada si existe
                        if (data && data.length > 0) {
                                set_default_address(data[0]);
                        }
                } catch (error) {
                        console.error('Error al cargar direcciones:', error);
                } finally {
                        set_loading(false);
                }
        };

        // Crear nueva dirección
        const add_address = async (addressData) => {
                try {
                        if (!is_authenticated || !user?.id) {
                                console.error('Usuario no autenticado');
                                return { success: false, error: 'Usuario no autenticado' };
                        }

                        set_loading(true);
                        const { data, error } = await createAddress(user.id, addressData);
                        if (error) throw error;

                        // Actualizar lista local
                        set_addresses((prev) => [...prev, data]);

                        // Si es la primera dirección, establecerla como predeterminada
                        if (addresses.length === 0) {
                                set_default_address(data);
                        }

                        return { success: true, data };
                } catch (error) {
                        console.error('Error al crear dirección:', error);
                        return { success: false, error: error.message };
                } finally {
                        set_loading(false);
                }
        };

        // Actualizar dirección existente
        const update_address = async (addressId, updates) => {
                try {
                        set_loading(true);
                        const { data, error } = await updateAddress(addressId, updates);
                        if (error) throw error;

                        // Actualizar lista local
                        set_addresses((prev) =>
                                prev.map((addr) =>
                                        addr.address_id === addressId ? data : addr
                                )
                        );

                        // Actualizar dirección predeterminada si es necesario
                        if (default_address?.address_id === addressId) {
                                set_default_address(data);
                        }

                        return { success: true, data };
                } catch (error) {
                        console.error('Error al actualizar dirección:', error);
                        return { success: false, error: error.message };
                } finally {
                        set_loading(false);
                }
        };

        // Eliminar dirección
        const remove_address = async (addressId) => {
                try {
                        set_loading(true);
                        const { error } = await deleteAddress(addressId);
                        if (error) throw error;

                        // Actualizar lista local
                        const updated_addresses = addresses.filter(
                                (addr) => addr.address_id !== addressId
                        );
                        set_addresses(updated_addresses);

                        // Si se eliminó la dirección predeterminada, establecer otra
                        if (default_address?.address_id === addressId) {
                                set_default_address(updated_addresses[0] || null);
                        }

                        return { success: true };
                } catch (error) {
                        console.error('Error al eliminar dirección:', error);
                        return { success: false, error: error.message };
                } finally {
                        set_loading(false);
                }
        };

        // Establecer dirección predeterminada
        const set_as_default = (addressId) => {
                const address = addresses.find((addr) => addr.address_id === addressId);
                if (address) {
                        set_default_address(address);
                }
        };

        return (
                <AddressesContext.Provider
                        value={{
                                addresses,
                                default_address,
                                loading,
                                add_address,
                                update_address,
                                remove_address,
                                set_as_default,
                                reload_addresses: load_addresses,
                        }}
                >
                        {children}
                </AddressesContext.Provider>
        );
};

// Hook personalizado para usar el contexto
export const useAddresses = () => {
        const context = useContext(AddressesContext);
        if (context === undefined) {
                throw new Error('useAddresses debe ser usado dentro de AddressesProvider');
        }
        return context;
};
