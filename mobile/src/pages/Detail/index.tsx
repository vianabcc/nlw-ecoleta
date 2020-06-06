import React, { useEffect, useState } from "react";
import api from "../../services/api";

import { TouchableOpacity, View, Image, Text, SafeAreaView, Linking } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import * as MailComposer from "expo-mail-composer";

import { styles } from "./styles";
import {Feather as Icon, FontAwesome} from "@expo/vector-icons";
import { RectButton } from "react-native-gesture-handler";

interface  RouteParams {
    point_id: number
}

interface Data {
    point: {
        name: string,
        image: string,
        image_url: string,
        email: string,
        whatsapp: string,
        city: string,
        uf: string
    }
    items: {
       title: string
    }[]
};

const Detail = () => {
    const [data, setData] = useState<Data>({} as Data)
    const navigation = useNavigation();
    const route = useRoute();

    const routeParams = route.params as RouteParams;

    useEffect(() => {
        const retrievePoint = async () => {
            const response = await api.get(`points/${routeParams.point_id}`);
            setData(response.data);
        };
        retrievePoint();
    }, []);

    if (!data.point) return null;

    return (
        <SafeAreaView style={{ flex: 1}}>
            <View style={styles.container}>
                <TouchableOpacity onPress={() => {navigation.goBack()}}>
                     <Icon name="arrow-left" size={20} color="#37CB79"/>
                 </TouchableOpacity>

                <Image
                    style={styles.pointImage}
                    source={{ uri: data.point.image_url}}
                />
                <Text style={styles.pointName}>{data.point.name}</Text>
                <Text style={styles.pointItems}>
                    {data.items.map(item => item.title).join(", ")}
                </Text>

                <View style={styles.address}>
                    <Text style={styles.addressTitle}>Endereço</Text>
                    <Text style={styles.addressContent}>{data.point.city}, {data.point.uf}</Text>
                </View>
            </View>

            <View style={styles.footer}>
                <RectButton style={styles.button} onPress={() => {
                    Linking.openURL(
                        `whatsapp://send?phone${data.point.whatsapp}&text=Tenho interesse sobre coleta de resíduos. Como funciona?`
                    )
                }}>
                    <FontAwesome name="whatsapp" color="#FFF" size={20} />
                    <Text style={styles.buttonText}>Whatsapp</Text>
                </RectButton>
                <RectButton style={styles.button} onPress={
                    async () => {
                        await MailComposer.composeAsync({
                            subject: "Interesse na coleta de resíduos",
                            recipients: [data.point.email],
                        })
                    }
                }>
                    <Icon name="mail" color="#FFF" size={20} />
                    <Text style={styles.buttonText}>E-mail</Text>
                </RectButton>

            </View>
        </SafeAreaView>
    );
};

export default Detail;