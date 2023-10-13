import axios from "axios";
import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from "../helpers/AuthContext";


function Home() {
    const [page, setPage] = useState(1);
    const [listOfCafe, setListOfCafe] = useState([]);
    const [favouriteCafes, setFavouriteCafes] = useState([]);
    const { authState } = useContext(AuthContext);
    let navigate = useNavigate()

    useEffect(() => {
        if (!localStorage.getItem("accessToken")) {
            navigate("/login")
        } else {
            const urlParams = new URLSearchParams(window.location.search);
            const pageParam = urlParams.get("page");
            setPage(pageParam ? parseInt(pageParam) : 1);

            axios.get(`http://localhost:3001/cafes/?page=${page}`, {
                headers: { accessToken: localStorage.getItem("accessToken") }
            }).then((response) => {
                setListOfCafe(response.data.listOfCafe);
                // setFavouriteCafes(response.data.favouriteCafes.map((favourite) => {
                //     return favourite.CafeId;
                // }));
            });
        }
    }, [page]);
    //if user not logged in, redirect to /login
    //else, set accesstoken in headers, and find all favourited cafe to highlight the favourite button, thus make it easier to detect which cafe user has favourited

    const handlePageChange = (newPage) => {
        setPage(newPage);
        navigate(`/?page=${newPage}`, {
            headers: { accessToken: localStorage.getItem("accessToken") }
        })
    };

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
            <div>PAGE {page}</div>
            <button style={{display: page <= 1 ? 'none' : ''}} onClick={() => handlePageChange(page - 1)}>Previous</button>
            <button onClick={() => handlePageChange(page + 1)}>Next</button>
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
                            <div onClick={() => { window.location.href = value.website; }}>Website</div>
                            {/* <button onClick={() => { favouriteACafe(value.id); }} className={favouriteCafes.includes(value.id) ? "unfavouritedCafe" : "favouritedCafe"}>⭐ ★</button>
                            <label>{value.Favourites.length}</label> */}
                        </div>
                    </div>
                );
            })}
            <div>PAGE {page}</div>
            <button style={{display: page <= 1 ? 'none' : ''}} onClick={() => handlePageChange(page - 1)}>Previous</button>
            <button onClick={() => handlePageChange(page + 1)}>Next</button>
        </div>
    );
}

export default Home