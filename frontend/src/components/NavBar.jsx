const NavBar = () => {
  return (
    <div className="navbar bg-base-100 shadow-md px-4">
      {/* Logo / Brand */}
      <div className="flex-1">
        <a className="btn btn-ghost normal-case text-xl">CorporateApp</a>
      </div>
      {/* Desktop Menu */}
      <div className="hidden lg:flex">
        <ul className="menu menu-horizontal px-1">
          <li>
            <a>Home</a>
          </li>
          <li>
            <a>About</a>
          </li>
          <li>
            <a>Services</a>
          </li>
          <li>
            <a>Contact</a>
          </li>
        </ul>
      </div>
      {/* Dark Mode Toggle */}
      <div className="flex-none">
        <label className="swap swap-rotate">
          {/* this hidden checkbox controls the state */}
          <input type="checkbox" className="theme-controller" value="dark" />
          {/* sun icon */}
          <svg
            className="swap-off fill-current w-6 h-6"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
          >
            <path d="M5.64 17.657l-1.414-1.414L7.05 13.43l1.414 1.415-2.828 2.828zm12.728 0l-2.828-2.828 1.414-1.415 2.829 2.829-1.415 1.414zM12 18a6 6 0 100-12 6 6 0 000 12zm0 2a8 8 0 110-16 8 8 0 010 16z" />
          </svg>
          {/* moon icon */}
          <svg
            className="swap-on fill-current w-6 h-6"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
          >
            <path d="M21.707 15.293a1 1 0 00-1.414 0 8.002 8.002 0 01-11.314 0 8.002 8.002 0 010-11.314 1 1 0 00-1.414-1.414 10 10 0 1014.142 14.142 1 1 0 000-1.414z" />
          </svg>
        </label>
      </div>
      {/* Mobile Menu */}
      <div className="dropdown dropdown-end lg:hidden">
        <label tabIndex={0} className="btn btn-ghost">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </label>
        <ul
          tabIndex={0}
          className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52"
        >
          <li>
            <a>Home</a>
          </li>
          <li>
            <a>About</a>
          </li>
          <li>
            <a>Services</a>
          </li>
          <li>
            <a>Contact</a>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default NavBar;
