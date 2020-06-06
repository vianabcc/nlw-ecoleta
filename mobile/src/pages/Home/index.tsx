import React, { useState, useEffect } from "react";
import { View, ImageBackground, Image, Text } from "react-native";
import RNPickerSelect from "react-native-picker-select";
import { useNavigation } from "@react-navigation/native";
import axios from "../../services/api";

import { AppLoading } from "expo";
import { RectButton } from "react-native-gesture-handler";
import { Feather as Icon } from "@expo/vector-icons";

import { Roboto_400Regular, Roboto_500Medium } from "@expo-google-fonts/roboto";
import { Ubuntu_700Bold, useFonts } from "@expo-google-fonts/ubuntu";
import { styles } from "./styles";

interface IBGEUFResponse {
    sigla: string,
    nome: string
};

interface IBGECityResponse {
    nome: string
};

const Home = () => {
  const [ufs, setUfs] = useState<IBGEUFResponse[]>([]);
  const [cities, setCities] = useState<string[]>([]);

  const [selectedUf, setSelectedUf] = useState<string>("0");
  const [selectedCity, setSelectedCity] = useState<string>("0");

  const navigation = useNavigation();

   useEffect(() => {
        const retrieveUfs = async () => {
            const response = await axios
                .get<IBGEUFResponse[]>("http://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome");

            const ufInitials = response.data.map(uf => {
                return { sigla: uf.sigla, nome: uf.nome }
            });
            setUfs(ufInitials);
        };
        retrieveUfs();
    }, [])

    useEffect(() => {
        const retrieveCities = async () => {
            const response = await axios
                .get<IBGECityResponse[]>(`http://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/municipios/`);

            const cities = response.data.map(city => city.nome);
            setCities(cities);
        };
        if(selectedUf) retrieveCities();
    }, [selectedUf])

  const [fontsLoaded] = useFonts({
      Roboto_400Regular,
      Roboto_500Medium,
      Ubuntu_700Bold
  });

  if(!fontsLoaded) {
      return <AppLoading />
  }

  return (
      <ImageBackground
          source={require("../../assets/home-background.png")}
          style={styles.container}
          imageStyle={{ width: 274, height: 368 }}
      >

        <View style={styles.main}>
          <Image source={require("../../assets/logo.png")} />
            <Text style={styles.title}>Seu markeplace de coleta de resíduos</Text>
            <Text style={styles.description}>Ajudamos pessoas a encontrarem pontos de coleta de forma eficiente.</Text>

            <View style={styles.containerDropdown}>
                <RNPickerSelect
                    style={{viewContainer: styles.select}}
                    placeholder={{ label: 'Selecione um estado', value: "0" }}
                    onValueChange={(value) => setSelectedUf(value)}
                    items={ufs.map(uf => {
                        return {
                            label: `${uf.sigla} - ${uf.nome}`,
                            value: uf.sigla
                        }
                    })}
                />
                <RNPickerSelect
                    style={{viewContainer: styles.select}}
                    placeholder={{ label: 'Selecione uma cidade', value: "0" }}
                    onValueChange={(value) => setSelectedCity(value)}
                    items={cities.map(city => {
                        return {
                            label: city,
                            value: city
                        }
                    })}
                />
            </View>
        </View>

        <View style={styles.footer}>
          <RectButton
              style={styles.button}
              onPress={() => {
                navigation.navigate("Points", { city: selectedCity, uf: selectedUf });
              }}>
              <View style={styles.buttonIcon}>
                  <Text>
                      <Icon name="arrow-right" color="#FFF" size={24}/>
                  </Text>
              </View>
              <Text style={styles.buttonText}>
                  Entrar
              </Text>
          </RectButton>
        </View>
      </ImageBackground>
  )
};

export default Home;