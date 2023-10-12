import axios from "axios";
import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from "../helpers/AuthContext";


function Home() {
    const [listOfCafe, setListOfCafe] = useState([]);
    const [favouriteCafes, setFavouriteCafes] = useState([]);
    const { authState } = useContext(AuthContext);
    let navigate = useNavigate()

    useEffect(() => {
        if (!localStorage.getItem("accessToken")) {
            navigate("/login")
        } else {
            axios.get("http://localhost:3001/cafes", {
                headers: { accessToken: localStorage.getItem("accessToken") }
            }).then((response) => {
                setListOfCafe(response.data.listOfCafe);
                // setFavouriteCafes(response.data.favouriteCafes.map((favourite) => {
                //     return favourite.CafeId;
                // }));
            });
        }
    }, []);
    //if user not logged in, redirect to /login
    //else, set accesstoken in headers, and find all favourited cafe to highlight the favourite button, thus make it easier to detect which cafe user has favourited

    const favouriteACafe = (cafeId) => {
        axios.post("http://localhost:3001/favourites", { CafeId: cafeId }, {
            headers: { accessToken: localStorage.getItem("accessToken") }
        }).then((response) => {
            setListOfCafe(listOfCafe.map((cafe) => {
                if (cafe.id === cafeId) {
                    if (response.data.favourited) {
                        return { ...cafe, Favourites: [...cafe.Favourites, 0] }
                    } else {
                        const favouriteArray = cafe.Favourites
                        favouriteArray.pop()
                        return { ...cafe, Favourites: favouriteArray }
                    }
                } else {
                    return cafe;
                }
            }))
            //
            if (favouriteCafes.includes(cafeId)) {
                setFavouriteCafes(
                    favouriteCafes.filter((id) => {
                        return id !== cafeId;
                    })
                )
            } else {
                setFavouriteCafes([...favouriteCafes, cafeId])
            }
        })
    }
    //



    return (
        <div>
            {listOfCafe.map((value, key) => {
                return (
                    <div className="post"  >
                        <div className="title">{value.name}</div>
                        <div className="body" onClick={() => { navigate(`/cafe/${value.id}`) }}>
                            {value.address}<br></br>
                            {value.phone}
                        <img src={value.image} alt={value.name} width={100} height={100}></img>
                        </div>
                        <div className="footer">
                            <div onClick={() => {window.location.href = value.website;}}>Website</div>
                            {/* <button onClick={() => { favouriteACafe(value.id); }} className={favouriteCafes.includes(value.id) ? "unfavouritedCafe" : "favouritedCafe"}>⭐ ★</button>
                            <label>{value.Favourites.length}</label> */}
                            
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

export default Home