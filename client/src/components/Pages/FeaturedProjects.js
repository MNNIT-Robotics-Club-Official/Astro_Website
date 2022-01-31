import React, { useState, useEffect } from "react";
import { Button } from "react-bootstrap";
import { animateScroll } from "react-scroll";
import Loading from "../../Animations/Loading";
import "../../css/featured-proj.css";
import { Link } from 'react-router-dom'
import { REACT_APP_BASE_TITLE, REACT_APP_SERVER } from "../../globalVars";
import { useDispatch, useSelector } from 'react-redux'

function FeaturedProjects() {

  const [projects, SetProjects] = useState([]);
  const [signedin, setsignedin] = useState(false)
  const [fetching, setFetching] = useState(1)
  const scrollId = useSelector(state => state.scrollId)
  const page = useSelector(state => state.page)
  const dispatch = useDispatch()
  const projects_per_page = 9;
  const no_of_pages = Math.ceil(projects.length / projects_per_page);

  useEffect(() => {
    document.title = `Flagship Projects | ${REACT_APP_BASE_TITLE}`;
    if (!scrollId) animateScroll.scrollToTop()
    fetch(`${REACT_APP_SERVER}/api/isSignedIn`, {
      method: "post",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          localStorage.removeItem("jwtToken");
          return;
        }
        setsignedin(0);
      });

    fetch(`${REACT_APP_SERVER}/api/projects/featured`, {
      method: "get",
    })
      .then((res) => res.json())
      .then((data) => {
        SetProjects(data)
        setFetching(0)
      });
  }, []);

  useEffect(() => {
    if (document.getElementById(scrollId)) {
      document.getElementById(scrollId).scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'center'
      });
    }
  }, [document.getElementById(scrollId)])

  return (
    <>
      <Loading time={2} fetching={fetching} />
      <div className="cont">
        <h3 className="my-3 titleBold d-flex justify-content-center topic">
          <p
            className=""
            style={{
              marginBottom: "0px",
              textAlign: "center",
              color: "rgb(29, 29, 29)",
            }}
          >
            FLAGSHIP PROJECTS
          </p>
        </h3>
        <div
          className="miniSep"
          style={{ marginBottom: "40px", background: "rgb( 67, 67, 204)" }}
        ></div>
        <div
          className="main"
          style={{ overflow: "hidden", minHeight: "31.7vh" }}
        >
          <ul className="cards">
            {projects
              .slice((page - 1) * projects_per_page, page * projects_per_page)
              .map((project, i) => (
                <li
                  className="cards_item"
                  data-aos="fade-up"
                  data-aos="flip-left"
                  data-aos-easing="linear"
                  data-aos-duration="1500"
                  key={project._id}
                  id={project._id}
                >
                  <div className="card cardproj">
                    <div className="card_image">
                      <img
                        className="evfeatured phoneviewproj"
                        src={
                          project.pic ||
                          "https://lh3.googleusercontent.com/Qc1N9hR-ovN8PDV6J9NOSF82BlUeEDtng33AUNn52x_8RajvRUOabe9C62hmtuWLRgPyjkXv6VbOG7PES8K3ZzWYFxyLuJSGIihC-_tc5kFsEiomcVbB-KWHPwWY3qu_JuhwMxzpAA=w2400"
                        }

                      />
                    </div>
                    <div
                      className="card_content forphone forphone1"
                      style={{ width: "100%" }}
                    >
                      <h2
                        className="card_title forphone forphone2"
                        style={{ width: "100%" }}
                      >
                        {project.title}
                      </h2>
                      <p
                        className="card_text forphone forphone3"
                        style={{ width: "100%" }}
                      >
                        {project.objective} <br />{" "}
                        <br />
                      </p>
                      <Button
                        className="btns card_btns"
                        variant="primary"
                        as={Link}
                        to={`/projects/${project._id}`}
                        style={{ marginTop: 10 }}
                        onClick={() => dispatch({ type: "SET_ID", payload: project._id })}
                      >
                        Read More
                      </Button>
                    </div>
                  </div>
                </li>
              ))}
          </ul>
          <div className="float-right mr-5 mb-3 mt-5">
            {page > 1 && (
              <Button
                className="mx-1"
                variant="danger"
                onClick={() => {
                  animateScroll.scrollToTop()
                  dispatch({ type: "SET_PAGE", payload: page - 1 })
                }}
              >
                <i className="fa fa-angle-double-left"></i> Previous
              </Button>
            )}
            {page < no_of_pages && (
              <Button
                variant="primary"
                className="mx-1"
                onClick={() => {
                  animateScroll.scrollToTop()
                  dispatch({ type: "SET_PAGE", payload: page + 1 })
                }}
              >
                Next <i className="fa fa-angle-double-right"></i>
              </Button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default FeaturedProjects;
