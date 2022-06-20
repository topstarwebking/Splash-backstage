import React, { useState } from "react";
import cn from "classnames";
import Slider from "react-slick";
import { Link } from "react-router-dom";
import styles from "./Popular.module.sass";
import Icon from "../../../components/Icon";
import Card2 from "../../../components/Card2";

const items = [
  {
    description: "You Only Live Once",
    name:"Jack London",
    cur_price: "0.1",
    coverData: "/images/content/topbook1.png"
  },
  {
    description: "You Only Live Once",
    name:"Jack London",
    cur_price: "0.1",
    coverData: "/images/content/topbook2.png"
  },
  {
    description: "You Only Live Once",
    name:"Jack London",
    cur_price: "0.1",
    coverData: "/images/content/topbook3.png"
  },
];

const SlickArrow = ({ currentSlide, slideCount, children, ...props }) => (
  <button {...props}>{children}</button>
);

const Popular = () => {
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
            <div className={styles.stage}>Top books</div>
          </div>
          <div className={styles.field}>
            <div className={styles.label}><span>View all &gt;</span></div>
          </div>
        </div>
        <div className={styles.wrapper}>
          <div className={styles.inner}>
            <Slider className="collection-slider" {...settings}>
              {items.map((x, index) => (
                <Link to="/profile" key={index}>
                  <Card2 className={styles.card} item={x} number={index+1}/>
                </Link>
              ))}
            </Slider>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Popular;
