import React from "react";
import cn from "classnames";
import Slider from "react-slick";
import { Link } from "react-router-dom";
import styles from "./Collections.module.sass";
import Icon from "../../../components/Icon";

const items1 = [
  {
    title: "Self-help",
    avatar: "/images/content/selfhelp.png",
    gallery: [
      "/images/content/categories1.png",
      "/images/content/categories2.png",
      "/images/content/categories3.png",
      "/images/content/categories4.png",
    ],
  },
  {
    title: "Leadership",
    avatar: "/images/content/leadership.png",
    gallery: [
      "/images/content/categories1.png",
      "/images/content/categories2.png",
      "/images/content/categories3.png",
      "/images/content/categories4.png",
    ],
  },
  {
    title: "History",
    avatar: "/images/content/history.png",
    gallery: [
      "/images/content/categories1.png",
      "/images/content/categories2.png",
      "/images/content/categories3.png",
      "/images/content/categories4.png",
    ],
  }]

const items2 = [
  {
    title: "Health",
    avatar: "/images/content/healthcare.png",
    gallery: [
      "/images/content/categories1.png",
      "/images/content/categories2.png",
      "/images/content/categories3.png",
      "/images/content/categories4.png",
    ],
  },
  {
    title: "Money finance",
    avatar: "/images/content/finance.png",
    gallery: [
      "/images/content/categories1.png",
      "/images/content/categories2.png",
      "/images/content/categories3.png",
      "/images/content/categories4.png",
    ],
  },
  {
    title: "Science & Engineering",
    avatar: "/images/content/light.png",
    gallery: [
      "/images/content/categories1.png",
      "/images/content/categories2.png",
      "/images/content/categories3.png",
      "/images/content/categories4.png",
    ],
  }]

const items3 = [
  {
    title: "Business",
    avatar: "/images/content/business.png",
    gallery: [
      "/images/content/categories1.png",
      "/images/content/categories2.png",
      "/images/content/categories3.png",
      "/images/content/categories4.png",
    ],
  },
  {
    title: "Education",
    avatar: "/images/content/education.png",
    gallery: [
      "/images/content/categories1.png",
      "/images/content/categories2.png",
      "/images/content/categories3.png",
      "/images/content/categories4.png",
    ],
  },
  {
    title: "Other",
    avatar: "/images/content/other.png",
    gallery: [
      "/images/content/categories1.png",
      "/images/content/categories2.png",
      "/images/content/categories3.png",
      "/images/content/categories4.png",
    ],
  },
  
];

const items = [items1, items2, items3];

const SlickArrow = ({ currentSlide, slideCount, children, ...props }) => (
  <button {...props}>{children}</button>
);

const Collections = () => {
  const settings = {
    infinite: false,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    nextArrow: (
      <SlickArrow>
        <Icon name="arrow-next" size="14" />
      </SlickArrow>
    ),
    prevArrow: (
      <SlickArrow>
        <Icon name="arrow-prev" size="14" />
      </SlickArrow>
    ),
    responsive: [
      {
        breakpoint: 1023,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 767,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  };

  return (
    <div className={cn("section", styles.section)}>
      <div className={cn("container", styles.container)}>
        <div className={styles.top}>
          <div className={styles.box}>
            <div className={styles.stage}>Categories</div>
          </div>
          <div className={styles.field}>   
            <div className={styles.label}><span>View all &gt;</span></div>
          </div>
        </div>
        <div className={styles.wrapper}>
          <div className={styles.inner}>
          {items.map((i, id) => (
            <Slider className="collection-slider" key={id} {...settings}>
              {i.map((x, index) => (
                <Link className={styles.item} to="/profile" key={id*1000+index}>
                  <div className={styles.subitem}>
                    <div className={styles.line}>
                      <div className={styles.subtitle}>{x.title}</div>
                      <div className={styles.avatar}>
                        <img src={x.avatar} alt="Avatar" />
                      </div>
                    </div>

                    <div className={styles.gallery}>
                      {x.gallery.map((x, index) => (
                        <div className={styles.preview} key={index}>
                          <img src={x} alt="Collection" />
                        </div>
                      ))}
                    </div>

                    <div className={styles.overlay}>

                    </div>
                  </div>

                </Link>

              ))}
            </Slider>
          ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Collections;