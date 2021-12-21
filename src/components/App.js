import React, { useState } from "react";
import '../index.css';
import Header from "./Header.js";
import Main from "./Main.js"
import Footer from "./Footer.js"
import api from "../utils/api.js";
import { CurrentUserContext } from "../contexts/CurrentUserContext";
import PopupWithForm from "./PopupWithForm";
import ImagePopup from "./ImagePopup";
import EditProfilePopup from "./EditProfilePopup";
import EditAvatarPopup from "./EditAvatarPopup";
import AddPlacePopup from "./AddPlacePopup";

function App() {

  const [selectedCard, setSelectedCard] = useState({});
  const [isEditProfilePopupOpen, setIsEditProfilePopupOpen] = useState(false);
  const [isAddPlacePopupOpen, setIsAddPlacePopupOpen] = useState(false);
  const [isEditAvatarPopupOpen, setIsEditAvatarPopupOpen] = useState(false);
  const [isImagePopupOpen, setIsImagePopupOpen] = useState(false);

  const [currentUser, setUserState] = useState({})
  const [cards, setCardsArray] = useState([])

  React.useEffect(() => {
    api.getUserinfo()
      .then(setUserState)
      .catch(err => console.error('user info error', err))
  }, []);

  React.useEffect(() => {
    api.getInitialCards()
      .then(setCardsArray)
      .catch(error => console.error('initial cards error', error))
  }, []);

  const handleEditAvatarClick = () => {
    setIsEditAvatarPopupOpen(true)
  }

  const handleEditProfileClick = () => {
    setIsEditProfilePopupOpen(true)
  }

  const handleAddPlaceClick = () => {
    setIsAddPlacePopupOpen(true)
  }

  const handleCardClick = (selectedCard) => {
    setSelectedCard(selectedCard);
    setIsImagePopupOpen(true);
  }

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
  }

  return (
    <CurrentUserContext.Provider value={currentUser}>
      <div className="page">
        <Header />
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
        <EditProfilePopup isOpen={isEditProfilePopupOpen} onClose={closeAllPopups} onUpdateUser={handleUpdateUser} />
        <EditAvatarPopup isOpen={isEditAvatarPopupOpen} onClose={closeAllPopups} onUpdateAvatar={handleUpdateAvatar} />
        <AddPlacePopup isOpen={isAddPlacePopupOpen} onClose={closeAllPopups} onAddPlace={handleAddPlace} />
        <PopupWithForm name="delete" title="Are you sure?" submitText="Yes" onClose={closeAllPopups} />
        <ImagePopup card={selectedCard} isOpen={isImagePopupOpen} onClose={closeAllPopups} />

        <Footer />
      </div>
    </CurrentUserContext.Provider>
  )
}


export default App;
