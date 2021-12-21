import React from 'react'
import logo from '../images/logo/logo.svg'

function Header() {
  return (
    <div className="header">
      <img
        src={logo}
        alt="around the US logo"
        className="header__logo"
      />
    </div>
  )
}

export default Header;
