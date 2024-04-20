// PokemonModal.js
import React from 'react';
import './PokemonModal.css'; 

const PokemonModal = ({ pokemon, onClose }) => {
  const calculateTotalStats = () => {
    const stats = ["hp", "attack", "defense", "special-attack", "special-defense", "speed"];
    let total = 0;
    for (const statName of stats) {
      total += pokemon.stats.find(stat => stat.stat.name === statName).base_stat;
    }
    return total;
  };

  const getBaseStatValue = (statName) => {
    return pokemon.stats.find(stat => stat.stat.name === statName).base_stat;
  };

  const renderStatBar = (statName) => {
    const value = getBaseStatValue(statName);
    const maxValue = 255;
    const percentage = (value / maxValue) * 100;
    return (
      <div className="stat-bar">
        <div className="stat-bar-fill" style={{ width: `${percentage}%` }}></div>
      </div>
    );
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <span className="close" onClick={onClose}>&times;</span>
        <p>#{pokemon.id}</p>
        <h2>{pokemon.koreanName ? pokemon.koreanName : pokemon.name}</h2>
        <img
          src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.id}.png`} 
          alt={pokemon.name}
          className="pokemon-image"
        />
        <p>타입: {pokemon.typesInKorean.join(', ')}</p>
        <p>기술: {pokemon.abilities.map(ability => ability.ability.name).join(', ')}</p>
        <div className="stats">
          <p>체력: {getBaseStatValue("hp")}</p>
          {renderStatBar("hp")}
          <p>공격: {getBaseStatValue("attack")}</p>
          {renderStatBar("attack")}
          <p>방어: {getBaseStatValue("defense")}</p>
          {renderStatBar("defense")}
          <p>특수공격: {getBaseStatValue("special-attack")}</p>
          {renderStatBar("special-attack")}
          <p>특수방어: {getBaseStatValue("special-defense")}</p>
          {renderStatBar("special-defense")}
          <p>속도: {getBaseStatValue("speed")}</p>
          {renderStatBar("speed")}
        </div>
        <p>합계: {calculateTotalStats()}</p>
      </div>
    </div>
  );
};

export default PokemonModal;
