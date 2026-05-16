// src/components/UserList.js
import { React, useState } from 'react';
import { FaUserCheck, FaUserClock } from 'react-icons/fa';
import "../../../styles/Users.css"

const Users = ({ roomData }) => {

  const iconStyleClock = {
    color: '#C0C0C0',       // Cor do ícone
    fontSize: '3rem',        // Tamanho do ícone
    margin: '0.0rem',        // Margem ao redor do ícone
    transition: 'color 0.3s' // Transição suave para a cor
  };

  const iconStyleCheck = {
    color: '#4caf50',       // Cor do ícone
    fontSize: '3rem',        // Tamanho do ícone
    margin: '0.0rem',        // Margem ao redor do ícone
    transition: 'color 0.3s' // Transição suave para a cor
  };


  return (
    <div className="user-list">
      {roomData.users.map((user, index) => (
        <div key={index} className="user-item">
          <span className="user-name">{user.nickName}</span>
          {user.vote == 0
            ? <FaUserClock style={iconStyleClock} />
            : <FaUserCheck style={iconStyleCheck} />}
          <div className="info-box">
            {roomData.status === 'VOTACAO_EM_ANDAMENTO' || roomData.status === 'VOTACAO_ENCERRADA'
              ? <span className="vote"></span>
              :
              <>
                {user.vote == 0
                  ? <span className="vote"></span>
                  : <span className="vote">{user.vote}</span>}
              </>}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Users;
