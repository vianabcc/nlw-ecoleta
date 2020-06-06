import React, {ChangeEvent, FormEvent, useEffect, useState} from "react";
import { Link, useHistory } from "react-router-dom";
import api from "services/api";
import axios from "axios";

import { FiArrowLeft, FiCheckCircle } from "react-icons/fi";
import { LeafletMouseEvent } from "leaflet";
import { Map, TileLayer, Marker } from "react-leaflet";
import Dropzone from "components/Dropzone";

import logo from "assets/logo.svg";
import "./styles.css";

interface Item {
    id: number,
    title: string,
    image_url: string
};

interface IBGEUFResponse {
    sigla: string,
    nome: string
};

interface IBGECityResponse {
    nome: string
};

const CreatePoint = () => {
    const [items, setItems] = useState<Item[]>([]);
    const [ufs, setUfs] = useState<IBGEUFResponse[]>([]);
    const [cities, setCities] = useState<string[]>([]);

    const [pointCreated, setPointCreated] = useState<boolean>(false);
    const [initialPosition, setInitialPosition] = useState<[number, number]>([0, 0]);

    const [formData, setFormData] = useState({ name: "", email: "", whatsapp: "" });
    const [selectedItems, setSelectedItems] = useState<number[]>([]);
    const [selectedUf, setSelectedUf] = useState<string>("");
    const [selectedCity, setSelectedCity] = useState<string>("");
    const [selectedFile, setSelectedFile] = useState<File>();
    const [selectedPosition, setSelectedPosition] = useState<[number, number]>(initialPosition);

    const history = useHistory();

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(position => {
            const { latitude, longitude } = position.coords;
            setInitialPosition([latitude, longitude]);
            setSelectedPosition([latitude, longitude]);
        })
    }, []);

    useEffect(() => {
        const retrieveItems = async () => {
            const response = await api.get("items/");
            setItems(response.data);
        };
        retrieveItems();
    }, []);

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

    const handleInputChange = ((e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({...formData, [name]: value })
    });

    return (
        <>
            <div id={pointCreated ? "modal-notification-on": "modal-notification-off"}>
                <div id="notification">
                    <FiCheckCircle />
                    <h1>Cadastro concluído!</h1>
                </div>
            </div>
            <div id="page-create-point">
                <header>
                    <img src={logo} alt="Ecoleta"/>
                    <Link to="/">
                        <FiArrowLeft />
                        Voltar para home
                    </Link>
                </header>
                <form onSubmit={
                   async (e: FormEvent<HTMLFormElement>) => {
                        e.preventDefault();

                        const [latitude, longitude] = selectedPosition;
                        const {name, email, whatsapp} = formData;
                        const uf = selectedUf;
                        const city = selectedCity;
                        const items = selectedItems;

                        const data = new FormData();

                        data.append("name", name);
                        data.append("email", email);
                        data.append("whatsapp", whatsapp);
                        data.append("uf", uf);
                        data.append("city", city);
                        data.append("latitude", String(latitude));
                        data.append("longitude", String(longitude));
                        data.append("items", items.join(","));
                        if(selectedFile){
                            data.append("image", selectedFile);
                        }
                        await api.post("points", data);

                        setPointCreated(true);

                        setTimeout(() => {
                           history.push("/");
                        }, 2000);
                    }
                }>
                    <h1>Cadastro do <br/> ponto de coleta</h1>

                    <Dropzone onFileUploaded={setSelectedFile}/>

                    <fieldset>
                        <legend><h2>Dados</h2></legend>
                        <div className="field">
                            <label htmlFor="name">Nome da entidadde</label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="field-group">
                           <div className="field">
                                <label htmlFor="email">E-mail</label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="field">
                                <label htmlFor="whatsapp">Whatsapp</label>
                                <input
                                    id="whatsapp"
                                    name="whatsapp"
                                    type="text"
                                    onChange={handleInputChange}
                                />
                            </div>
                        </div>
                    </fieldset>
                    <fieldset>
                        <legend>
                            <h2>Endereço</h2>
                            <span>Selecione o endereço no mapa</span>
                        </legend>

                        <Map
                            center={initialPosition}
                            zoom={15}
                            onClick={(e: LeafletMouseEvent) => {
                                setSelectedPosition([e.latlng.lat, e.latlng.lng])
                            }}>
                             <TileLayer
                                  attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />

                            <Marker position={selectedPosition} />
                        </Map>

                        <div className="field-group">
                           <div className="field">
                                <label htmlFor="uf">Estado (UF)</label>
                               <select
                                   id="uf"
                                   name="uf"
                                   value={selectedUf}
                                   onChange={(e: ChangeEvent<HTMLSelectElement>) => setSelectedUf(e.target.value)}
                               >
                                   <option value="0">Selecione uma UF</option>
                                   {ufs.map((uf)=> (
                                        <option key={uf.sigla} value={uf.sigla}>{uf.sigla} - {uf.nome}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="field">
                                <label htmlFor="city">Cidade</label>
                                <select
                                    id="city"
                                    name="city"
                                    value={selectedCity}
                                    onChange={(e: ChangeEvent<HTMLSelectElement>) => setSelectedCity(e.target.value)}
                                >
                                    <option value="0">Selecione uma cidade</option>
                                    {cities.map(city=> (
                                        <option key={city} value={city}>{city}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </fieldset>
                    <fieldset>
                        <legend>
                            <h2>Itens de coleta</h2>
                            <span>Selecione um ou mais itens abaixo</span>
                        </legend>
                        <ul className="items-grid">
                            {items.map(item =>  (
                                <li
                                    key={item.id}
                                    onClick={() => {
                                        const alreadySelected = selectedItems.findIndex(id => item.id === id);
                                        alreadySelected >= 0
                                            ? setSelectedItems(selectedItems.filter(id => item.id !== id))
                                            : setSelectedItems([...selectedItems, item.id ]);
                                    }}
                                    className={selectedItems.includes(item.id) ? "selected" : ""}
                                >
                                    <img src={item.image_url} alt={item.title}/>
                                    <span>{item.title}</span>
                                </li>
                            ))}
                        </ul>
                    </fieldset>
                    <button type="submit">Cadastrar ponto de coleta</button>
                </form>
            </div>
        </>
    );
};

export default CreatePoint;