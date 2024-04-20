// App.js
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './App.css';
import PokemonModal from './PokemonModal';

const typeNames = {
  normal: '노말',
  fighting: '격투',
  flying: '비행',
  poison: '독',
  ground: '땅',
  rock: '바위',
  bug: '벌레',
  ghost: '고스트',
  steel: '강철',
  fire: '불',
  water: '물',
  grass: '풀',
  electric: '전기',
  psychic: '에스퍼',
  ice: '얼음',
  dragon: '드래곤',
  dark: '악',
  fairy: '페어리'
};

const getTypeNameInKorean = (type) => {
  return typeNames[type] || type;
};

function App() {
  const [pokemonList, setPokemonList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [shinyMode, setShinyMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPokemon, setSelectedPokemon] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const observer = useRef();

  useEffect(() => {
    fetchPokemon();
  }, []);

  useEffect(() => {
    if (!loading && hasMore) {
      const options = {
        root: null,
        rootMargin: '0px',
        threshold: 1.0
      };
      observer.current = new IntersectionObserver(handleObserver, options);
      if (observer.current) {
        observer.current.observe(document.getElementById('observer'));
      }
    }
  }, [loading, hasMore]);

  const handleObserver = (entities, observer) => {
    const target = entities[0];
    if (target.isIntersecting && hasMore) {
      observer.unobserve(target.target);
      fetchPokemon();
    }
  };

  const fetchPokemon = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=50`);
      const results = response.data.results;
      const newPokemonList = await Promise.all(results.map(async (pokemon) => {
        const detailsResponse = await axios.get(pokemon.url);
        const speciesResponse = await axios.get(detailsResponse.data.species.url);
        const koreanName = speciesResponse.data.names.find(name => name.language.name === "ko").name;
        const typesInKorean = detailsResponse.data.types.map(type => getTypeNameInKorean(type.type.name));
        return { ...detailsResponse.data, imageNumber: parseInt(pokemon.url.split("/")[6]), koreanName, typesInKorean };
      }));

      let filteredPokemonList = newPokemonList;
  
      setPokemonList((prevPokemonList) => {
        const uniquePokemonList = [...prevPokemonList, ...filteredPokemonList];
        return uniquePokemonList.filter((pokemon, index, self) =>
          index === self.findIndex((p) => p.id === pokemon.id)
        );
      });
  
      if (results.length < 50) {
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error fetching Pokemon:', error);
    }
    setLoading(false);
    setOffset(pokemonList.length);
  };

  const toggleShinyMode = () => {
    setShinyMode(!shinyMode);
  };

  const toggleHomeMode = () => {
    setShinyMode(false);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handlePokemonClick = (pokemon) => {
    setSelectedPokemon(pokemon);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  

  return (
    <div className="App">
      <nav className="navbar">
        <ul>
          <h1>Pokemon Dictionary</h1>
          <li><a href="/" onClick={toggleHomeMode}>Home</a></li>
          <li><a onClick={toggleShinyMode}>{shinyMode ? 'Shiny' : 'Normal'}</a></li>
          <li>
            <input
              type="text"
              className='search'
              placeholder="Search Pokemon"
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </li>
        </ul>
      </nav>
     
      <div className="pokemon-container">
        {pokemonList
          .filter(pokemon => {
            return pokemon.koreanName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                   pokemon.name.toLowerCase().includes(searchTerm.toLowerCase());
          })
          .map((pokemon, index) => (
            <div key={index} className="pokemon-wrapper" onClick={() => handlePokemonClick(pokemon)}>
              <div className="pokemon-info">
                <small>#{pokemon.id}</small>
                <img 
                  src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${shinyMode ? 'shiny/' : ''}${pokemon.imageNumber}.png`}
                  alt={pokemon.name} 
                />
                <p className='name'>{pokemon.koreanName ? pokemon.koreanName : pokemon.name}</p>
                <p>타입: {pokemon.typesInKorean.join(', ')}</p> 
              </div>
            </div>
          ))}
        <div id="observer"></div>
      </div>
      
      {!loading && hasMore && <p></p>}
      
      {modalOpen && selectedPokemon && (
        <PokemonModal pokemon={selectedPokemon} onClose={closeModal} />
      )}
    </div>
  );
}

export default App;
