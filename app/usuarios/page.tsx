"use client";
import React, { useState } from "react";
import "./usuarios.component.css";
import { admnUsers } from "@/utils/constants";
import Input from "../components/Input";

type Role = "admin" | "user";
type Realm =
  | "user" // Dominio de usuarios
  | "root" // Superusuario o dominio raíz
  | "ldap" // Dominio LDAP (autenticación LDAP)
  | "internal" // Dominio interno
  | "redaction" // Dominio de redacción
  | "developer"; // Dominio de desarrollador

interface UserProps {
  id: string;
  name: string;
  email: string;
  roles: Role[];
  realms: Realm[];
  lastLogin: Date;
  createdAt: Date;
}

const page: React.FC<UserProps> = ({
  id,
  name,
  email,
  roles,
  realms,
  lastLogin,
  createdAt,
}) => {
  const [view, setView] = useState<"simple-view" | "advanced-view">(
    "simple-view"
  );

  const handleViewChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedValue = event.target.value;
    setView(selectedValue as "simple-view" | "advanced-view");
  };
  const removeAccents = (text: string) => {
    return text
      .normalize("NFD") // Descompone caracteres acentuados en dos partes (caracter base + acento)
      .replace(/[\u0300-\u036f]/g, ""); // Elimina los caracteres de acento
  };

  const [search, setSearch] = useState("");

  const lowerSearch = removeAccents(search.toLowerCase());

  const filteredUsers = admnUsers.filter((user) => {
    return (
      user.id.includes(lowerSearch) ||
      removeAccents(user.name.toLocaleLowerCase()).includes(lowerSearch) ||
      removeAccents(user.email).includes(lowerSearch)
    );
  });

  const handleUserSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  return (
    <>
      <div className="w-full overflow-auto table-container">
        <section>
          <div className="container" id="toggle">
            <div className="tabs">
              <input
                type="radio"
                id="simple-view"
                name="tabletoggle"
                value="simple-view"
                checked={view === "simple-view"}
                onChange={handleViewChange}
              />
              <label className="tab" htmlFor="simple-view">
                Vista Simple
              </label>
              <input
                type="radio"
                id="advanced-view"
                name="tabletoggle"
                value="advanced-view"
                checked={view === "advanced-view"}
                onChange={handleViewChange}
              />
              <label className="tab" htmlFor="advanced-view">
                Vista Avanzada
              </label>
              <span className="glider"></span>
              <Input
                label="Buscar Usuarios"
                name="searchUsers"
                id="searchUsers"
                type="search"
                onChange={handleUserSearch}
                className="search-bar float-end"
              />
            </div>
          </div>

          <ul className="legend">
            <li>
              <h4>Leyenda:</h4>
            </li>
            <li>
              <span className="point default"></span>por defeto
            </li>
            <li>
              <span className="point manual"></span>Manual
            </li>
            <li>
              <span className="point sso"></span>del SSO
            </li>
            <li>
              <span className="point group"></span>del grupo
            </li>
          </ul>
        </section>

        <table
          className={`ft-table ${
            view === "simple-view" ? "simple-view" : "advanced-view"
          }`}
        >
          <tbody>
            <tr className="table-header">
              <td>
                <input type="checkbox"></input>
              </td>
              <td></td>
              <td>
                <div tabIndex={0} className="sort-header unsorted">
                  <input
                    type="text"
                    tabIndex={-1}
                    role="presentation"
                    style={{
                      opacity: "0",
                      height: "1px",
                      width: "1px",
                      zIndex: "-1",
                      overflow: "hidden",
                      position: "absolute",
                    }}
                  />
                  <span className="gwt-InlineLabel">Nombre</span>
                </div>
              </td>
              <td className="header-created">
                <div tabIndex={0} className="sort-header unsorted">
                  <input
                    type="text"
                    tabIndex={-1}
                    role="presentation"
                    style={{
                      opacity: "0",
                      height: "1px",
                      width: "1px",
                      zIndex: "-1",
                      overflow: "hidden",
                      position: "absolute",
                    }}
                  />
                  <span className="gwt-InlineLabel">Fecha de Creación</span>
                </div>
              </td>
              <td className="header-login">
                <div tabIndex={0} className="sort-header unsorted">
                  <input
                    type="text"
                    tabIndex={-1}
                    role="presentation"
                    style={{
                      opacity: "0",
                      height: "1px",
                      width: "1px",
                      zIndex: "-1",
                      overflow: "hidden",
                      position: "absolute",
                    }}
                  />
                  <span className="gwt-InlineLabel">&Uacute;ltimo login</span>
                </div>
              </td>
              <td>
                <div tabIndex={0} className="sort-header unsorted">
                  <input
                    type="text"
                    tabIndex={-1}
                    role="presentation"
                    style={{
                      opacity: "0",
                      height: "1px",
                      width: "1px",
                      zIndex: "-1",
                      overflow: "hidden",
                      position: "absolute",
                    }}
                  />
                  <span className="gwt-InlineLabel">Dominios</span>
                </div>
              </td>
              <td>Grupos</td>
              <td>Roles</td>
              <td className="adminusers-stats-column">Stats</td>
              <td>{/* <!--edit col--> */}</td>
            </tr>

            {filteredUsers.map((user) => {
              const creationDate = user.createdAt.toLocaleDateString("es-ES");
              const lastLoginDate = user.lastLogin.toLocaleDateString("es-ES");
              const lastLoginTime = user.lastLogin.toLocaleTimeString("es-ES");

              const rolesDisplay = user.roles.map((role) => (
                <li key={role}>
                  {role.includes("admin") && (
                    <span className="point sso"></span>
                  )}
                  {role.includes("user") && (
                    <span className="point manual"></span>
                  )}
                  {role.includes("developer") && (
                    <span className="point developer"></span>
                  )}
                  <span className="gwt-InlineLabel">{role}</span>
                </li>
              ));

              const realmsDisplay = user.realms
                .map((realm) => {
                  if (realm === "root") return "Root User";
                  if (realm === "ldap") return "LDAP";
                  return realm.charAt(0).toUpperCase() + realm.slice(1);
                })
                .map((realm, index) => (
                  <li key={index}>
                    <span className="point sso"></span>
                    <span className="gwt-InlineLabel">{realm}</span>
                  </li>
                ));

              return (
                <tr key={user.id}>
                  <td>
                    <input type="checkbox" />
                  </td>
                  <td></td>
                  <td className="text-column adminusers-display-name-column">
                    <div>
                      <div className="adminusers-user-info">
                        <span className="ft-btn-inner-text">{user.name}</span>
                        <div className="adminusers-user-locked adminusers-hide"></div>
                      </div>
                      <div className="adminusers-user-detail">{user.email}</div>
                    </div>
                  </td>
                  <td className="text-column adminusers-creation-date-column">
                    {creationDate}
                  </td>
                  <td className="text-column adminusers-last-login-date-column">
                    {lastLoginDate}
                    <div className="adminusers-user-detail">
                      {lastLoginTime}
                    </div>
                  </td>
                  <td className="text-column adminusers-realms-column">
                    <ul className="admin-item-list">{realmsDisplay}</ul>
                  </td>
                  <td className="text-column adminusers-groups-column">
                    <span className="resume">
                      <span className="point sso"></span>
                      <span className="point manual"></span>3
                    </span>
                    <ul className="admin-item-list">
                      <li>
                        <span className="point sso"></span>
                        <span className="gwt-InlineLabel">ADMIN</span>
                      </li>
                      <li>
                        <span className="point manual"></span>
                        <span className="gwt-InlineLabel">tech-writer</span>
                      </li>
                      <li>
                        <span className="point manual"></span>
                        <span className="gwt-InlineLabel">MARKETING</span>
                      </li>
                    </ul>
                  </td>
                  <td className="text-column adminusers-roles-column">
                    <span className="resume">
                      <span className="point sso"></span>
                      <span className="point manual"></span>
                      <span className="point group"></span>8
                    </span>
                    <ul className="admin-item-list">{rolesDisplay}</ul>
                  </td>
                  <td className="text-column adminusers-stats-column">
                    <ul className="admin-item-list">
                      <li>PBK : 0</li>
                      <li>Bookmarks : 0</li>
                      <li>Saved searches : 0</li>
                    </ul>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="ft-btn ft-btn-no-bg adminusers-user-display-name"
                      title="Fluid Topics Root User"
                    >
                      <i className="ft-icon"></i>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default page;
