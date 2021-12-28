import React, { useState } from "react";
import { Switch, Route, useHistory } from 'react-router-dom';
import '../index.css';
import Header from "./Header.js";
import Main from "./Main.js";
import Footer from "./Footer.js";
import api from "../utils/api.js";
import { CurrentUserContext } from "../contexts/CurrentUserContext";
import PopupWithForm from "./PopupWithForm";
import ImagePopup from "./ImagePopup";
import EditProfilePopup from "./EditProfilePopup";
import EditAvatarPopup from "./EditAvatarPopup";
import AddPlacePopup from "./AddPlacePopup";
import ProtectedRoute from "./ProtectedRoute";
import Login from "./Login";
import Register from "./Register";
import InfoTooltip from "./InfoTooltip";
import * as auth from '../utils/auth';

function App() {

  const [selectedCard, setSelectedCard] = useState({});
  const [isEditProfilePopupOpen, setIsEditProfilePopupOpen] = useState(false);
  const [isAddPlacePopupOpen, setIsAddPlacePopupOpen] = useState(false);
  const [isEditAvatarPopupOpen, setIsEditAvatarPopupOpen] = useState(false);
  const [isImagePopupOpen, setIsImagePopupOpen] = useState(false);
  const [isInfoTooltipOpen, setIsInfoTooltipOpen] = useState(false);

  const [currentUser, setUserState] = useState({});
  const [cards, setCardsArray] = useState([]);

  const [loggedIn, setLoggedIn] = useState(false);
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const history = useHistory();

  React.useEffect(() => {
    api.getUserinfo()
      .then(setUserState)
      .catch(err => console.error('user info error', err));
  }, []);

  React.useEffect(() => {
    api.getInitialCards()
      .then(setCardsArray)
      .catch(error => console.error('initial cards error', error));
  }, []);

  React.useEffect(() => {
    tokenCheck();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [history]);

  const handleEditAvatarClick = () => {
    setIsEditAvatarPopupOpen(true);
  };

  const handleEditProfileClick = () => {
    setIsEditProfilePopupOpen(true);
  };

  const handleAddPlaceClick = () => {
    setIsAddPlacePopupOpen(true);
  };

  const handleCardClick = (selectedCard) => {
    setSelectedCard(selectedCard);
    setIsImagePopupOpen(true);
  };

  const handleUpdateUser = (data) => {
    api.updateUserInfo(data)
      .then(setUserState)
      .then(closeAllPopups)
      .catch(error => console.error('update user error', error))
  }

  const handleUpdateAvatar = (data) => {
    api.setUserAvatar(data)
      .then(setUserState)
      .then(closeAllPopups)
      .catch(error => console.error('update avatar error', error))
  }

  const handleAddPlace = (data) => {
    api.createCard(data)
      .then((newCard) => {
        setCardsArray([newCard, ...cards])
      })
      .then(closeAllPopups)
      .catch(error => console.error('add place error', error))
  }

  const handleRegister = ({ email, password }) => {
    auth.register({ email, password })
      .then(() => {
        setMessage(true)
      })
      .catch((err, res) => {
        setMessage(false)
        if (err.statusCode === 400) {
          res.status(400).send('one of the fields was filled in incorrectly')
        } else {
          res.status(500).send('an error occured')
        }
      })
      .finally(() => setIsInfoTooltipOpen(true))
  }

  const handleLogin = ({ email, password }) => {
    auth.login({ email, password })
      .then((res) => {
        if (res.token) {
          setLoggedIn(true)
          setEmail(res.email)
        } else {
          setLoggedIn(false)
        }
        tokenCheck();
      })
      .catch((err, res) => {
        if (err.statusCode === 400) {
          res.status(400).send('one or more of the fields were not provided')
        } else if (err.statusCode === 401) {
          res.status(401).send('the user with the specified email not found')
        } else {
          res.status(500).send('an error occured')
        }
      })
      .finally(() => history.push('/'))
  }

  const tokenCheck = () => {
    const token = localStorage.getItem('token');
    if (token) {
      auth.getContent(token)
        .then((res) => {
          (console.log(res));
          if (res) {
            setEmail(res.data.email)
            setLoggedIn(true)
            history.push('/');
          }
        })
        .catch((err, res) => {
          if (err.statusCode === 400) {
            res.status(400).send('Token not provided or provided in the wrong format')
          } else if (err.statusCode === 401) {
            res.status(401).send('The provided token is invalid')
          } else {
            res.status(500).send('an error occured')
          }
        })
    }
  }

  const handleLogout = () => {
    setEmail('')
    setLoggedIn(false);
    history.push('/');
    localStorage.removeItem('token')
  }

  function handleCardLike(card) {
    const isLiked = card.likes.some(i => i._id === currentUser._id);
    api.changeLikeCardStatus(card._id, !isLiked)
      .then((newCard) => {
        setCardsArray((state) => state.map((c) => c._id === card._id ? newCard : c));
      })
      .catch(error => console.error('like card error', error))
  }

  function handleCardDelete(card) {
    api.deleteCard(card._id)
      .then(() => {
        setCardsArray(cards.filter(((c) => c._id !== card._id)))
      })
      .catch(error => console.error('delete card error', error))
  }

  const closeAllPopups = () => {
    setIsEditProfilePopupOpen(false);
    setIsAddPlacePopupOpen(false);
    setIsEditAvatarPopupOpen(false);
    setIsImagePopupOpen(false);
    setIsInfoTooltipOpen(false);
  }

  return (
    <CurrentUserContext.Provider value={currentUser}>
      <div className="page">
        <Switch>
          <Route path='/signup'>
            <Header loggedIn={loggedIn} linkPath='/signin' linkTitle='Log in' />
            <Register onRegister={handleRegister} />
          </Route>
          <Route path='/signin'>
            <Header loggedIn={loggedIn} linkPath='/signup' linkTitle='Sign up' />
            <Login onLogin={handleLogin} />
          </Route>
        </Switch>
        <ProtectedRoute loggedIn={loggedIn} exact path='/' >
          <Header loggedIn={loggedIn} onLogout={handleLogout} email={email} linkPath='/signup' linkTitle='Log out' />

          <Main
            onEditProfileClick={handleEditProfileClick}
            onAddPlaceClick={handleAddPlaceClick}
            onEditAvatarClick={handleEditAvatarClick}
            onCardClick={handleCardClick}
            closeAllPopups={closeAllPopups}
            handleCardLike={handleCardLike}
            handleCardDelete={handleCardDelete}
            cards={cards}
            currentUser={currentUser}
          />
          {loggedIn && <Footer />}

          <InfoTooltip loggedIn={loggedIn} onClose={closeAllPopups} isOpen={isInfoTooltipOpen} message={message} />

          <EditProfilePopup isOpen={isEditProfilePopupOpen} onClose={closeAllPopups} onUpdateUser={handleUpdateUser} />
          <EditAvatarPopup isOpen={isEditAvatarPopupOpen} onClose={closeAllPopups} onUpdateAvatar={handleUpdateAvatar} />
          <AddPlacePopup isOpen={isAddPlacePopupOpen} onClose={closeAllPopups} onAddPlace={handleAddPlace} />
          <PopupWithForm name="delete" title="Are you sure?" submitText="Yes" onClose={closeAllPopups} />
          <ImagePopup card={selectedCard} isOpen={isImagePopupOpen} onClose={closeAllPopups} />
        </ProtectedRoute>

      </div>
    </CurrentUserContext.Provider >
  )
}

export default App;
