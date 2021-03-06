import React, { useEffect, useState } from 'react'
import '../../css/apod.css'
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';

export default function APOD() {

    const [data, setData] = useState({})

    useEffect(() => {
        fetch('https://api.nasa.gov/planetary/apod?api_key=uc04exQjhM4tO8QCCl0wcuAvJ4QMaJJxDfofWrvm', {
            method: 'GET'
        }).then(res => res.json())
            .then(data => setData(data))
    }, [])

    return (
        <div className="cont my-5">
            <div className="container-fluid">

                <div
                    className="pageTitle titleBold headingc white-headingc backst"
                    data-aos="fade-down"
                    style={{ marginBottom: "5px", color: "rgb(25, 25, 25)" }}
                >
                    Astronomy Picture of the Day
        </div>
                <div className="miniSep" style={{ marginBottom: "20px" }}></div>
                <div className="d-flex flex-column flex-md-row container apod-container  col-11 col-lg-9 mx-auto my-5 border">
                    <div className="information text-center mt-5 mb-2">
                        <div className="title">
                            <h3>{data?.title}</h3>
                        </div>
                        <div className="explanation mx-3 mx-md-3 mt-md-2 mt-lg-5 mozStyle" id="style-2">
                            <p className="expl">{data?.explanation} <br></br><br></br><div>source : <i><a href="https://apod.nasa.gov/apod/astropix.html" target="_blank">apod.nasa.gov</a></i></div></p>
                        </div>
                    </div>
                    <div className="hdimage">
                        {data?.media_type === 'video' ?
                            <iframe src={data?.url} className=''></iframe>
                            :
                            <a href={data?.hdurl} target='_blank'>
                                <LazyLoadImage src={data?.url} alt="apod" effect='blur' />
                            </a>
                        }
                    </div>
                </div>
            </div>
        </div>
    )
}
