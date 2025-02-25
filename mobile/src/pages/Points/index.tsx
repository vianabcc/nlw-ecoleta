import React, { useState, useEffect } from "react";
import {useNavigation, useRoute} from "@react-navigation/native";
import {View, Text, TouchableOpacity, ScrollView, Image, SafeAreaView, Alert} from "react-native";

import api from "../../services/api";

import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import { SvgUri } from "react-native-svg";
import { Feather as Icon } from "@expo/vector-icons";
import { styles } from "./styles";

interface Item {
    id: number,
    title: string,
    image_url: string
}

interface Points {
    id: number,
    name: string,
    image: string,
    image_url: string,
    latitude: number,
    longitude: number,
}

interface  RouteParams {
    city: string,
    uf: string
}

const Points = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const routeParams = route.params as RouteParams;

    const [items, setItems] = useState<Item[]>([])
    const [points, setPoints] = useState<Points[]>([])
    const [selectedItems, setSelectedItems] = useState<number[]>([])
    const [initialPosition, setInitialPosition] = useState<[number, number]>([0, 0]);

    useEffect(() => {
        const loadPosition = async () => {
            const { status } = await Location.requestPermissionsAsync();

            if(status !== "granted") {
                Alert.alert("Ooops....", "Precisamos de sua permissão para obter a localização! ");
                return ;
            };

            const location = await Location.getCurrentPositionAsync();
            const { latitude, longitude } = location.coords;
            setInitialPosition([latitude, longitude]);
        };
        loadPosition();
    }, []);

    useEffect(() => {
        const retrieveItems = async () => {
            const response = await api.get("items/");
            setItems(response.data);
        };
        retrieveItems();
    }, []);

    useEffect(() => {
        const retrievePoints = async () => {
            const response = await api.get("points/", {
                params: {
                    city: routeParams.city,
                    uf: routeParams.uf,
                    items: selectedItems
                }
            })

            setPoints(response.data)
        };

        retrievePoints();
    }, [selectedItems]);

    return (
        <SafeAreaView style={{ flex: 1}}>
            <View style={styles.container}>
                 <TouchableOpacity onPress={() => {navigation.goBack()}}>
                     <Icon name="arrow-left" size={20} color="#37CB79"/>
                 </TouchableOpacity>

                 <Text style={styles.title}>Bem vindo.</Text>
                 <Text style={styles.description}>Encontre no mapa um ponto de coleta.</Text>

                 <View style={styles.mapContainer}>
                     {initialPosition[0] !== 0 && (
                          <MapView
                             style={styles.map}
                             initialRegion={{
                                 latitude: initialPosition[0],
                                 longitude: initialPosition[1],
                                 latitudeDelta: 0.014,
                                 longitudeDelta: 0.014
                             }}
                         >
                              {points.map(point => (
                                  <Marker key={String(point.id)}
                                     onPress={() => { navigation.navigate("Detail", { point_id: point.id})}}
                                     style={styles.mapMarker}
                                     coordinate={{ latitude: point.latitude, longitude: point.longitude }}
                                   >
                                     <View style={styles.mapMarkerContainer}>
                                         <Image
                                             style={styles.mapMarkerImage}
                                             source={{ uri: point.image_url }}
                                         />
                                         <Text style={styles.mapMarkerTitle}>{point.name}</Text>
                                     </View>
                                 </Marker>
                              ))}
                         </MapView>
                     )}
                 </View>
            </View>
            <View style={styles.itemsContainer}>
                <ScrollView
                    contentContainerStyle={{ paddingHorizontal: 20 }}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                >
                    {items.map(item => (
                       <TouchableOpacity
                           key={String(item.id)}
                           style={[
                               styles.item,
                               selectedItems.includes(item.id) ? styles.selectedItem : {}
                           ]}
                           onPress={() => {
                                const alreadySelected = selectedItems.findIndex(id => item.id === id);
                                alreadySelected >= 0
                                    ? setSelectedItems(selectedItems.filter(id => item.id !== id))
                                    : setSelectedItems([...selectedItems, item.id ]);
                            }}
                            activeOpacity={0.6}
                       >

                           <SvgUri width={42} height={42} uri={item.image_url} />
                          <Text style={styles.itemTitle}>{item.title}</Text>
                       </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>
        </SafeAreaView>
    );
};

export default Points;