import React from "react";
import cn from "classnames";
import Slider from "react-slick";
import styles from "./HotBid.module.sass";
import Icon from "../Icon";
import Card from "../Card";

import { useState, useEffect } from "react";
import { useSelector, useDispatch } from 'react-redux';
import {connect} from "react-redux";
import { getUploadedNFTs } from '../../store/actions/upload';
import axios from 'axios';
import { API_ENDPOINT } from '../../constants';

// data
// import { bids } from "../../mocks/bids";

const SlickArrow = ({ currentSlide, slideCount, children, ...props }) => (
  <button {...props}>{children}</button>
);


const Hot = ({ classSection, uploadedNfts }) => {
  console.log(uploadedNfts)
  const [tokens, setTokens] = useState<Array<any>>([]);

  useEffect(() => {
    let mounted = true;
    async function fetchTokens() {
      const { data } = await axios.get(API_ENDPOINT + "/token/all")
      const tokens = data.data.tokens.map((token: any) => {
        return {
          ...token,
          category: "green",
          categoryText: token.status == 2 ? "Ended" : "Purchasing",
          highestBid: 0,
          users: [],
          bid: ''
        };
      })

      if (mounted) setTokens(tokens);
    }

    fetchTokens();
    return () => { mounted = false; }
  }, []);

  const settings = {
    infinite: false,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    nextArrow: (
      <SlickArrow currentSlide={0} slideCount={1}>
        <Icon name="arrow-next" size="14" />
      </SlickArrow>
    ),
    prevArrow: (
      <SlickArrow currentSlide={0} slideCount={1}>
        <Icon name="arrow-prev" size="14" />
      </SlickArrow>
    ),
    responsive: [
      {
        breakpoint: 1179,
        settings: {
          slidesToShow: 3,
        },
      },
      {
        breakpoint: 1023,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 767,
        settings: {
          slidesToShow: 2,
          infinite: true,
        },
      },
    ],
  };

  return (
    <div className={cn(classSection, styles.section)}>
      <div className={cn("container", styles.container)}>
        <div className={styles.wrapper}>
          <h3 className={cn("h3", styles.title)}>Hot bid</h3>
          <div className={styles.inner}>
            <Slider className="bid-slider" {...settings}>
              {tokens.map((x, index) => (
                <Card key={index} className={styles.card} item={x} />
              ))}
            </Slider>
            {/* <Slider className="bid-slider" {...settings}>
              {uploadedNfts.map((x, index) => (
                <Card key={index} className={styles.card} item={x} />
              ))}
            </Slider> */}
          </div>
        </div>
      </div>
    </div>
  );
};

//export default Hot;


const mapToStateProps = ({uploading}) => ({
  uploadedNfts: uploading.uploadedNfts
});

const mapToDispatchProps = (dispatch) => ({
  getUploadedNFTs: () => dispatch(getUploadedNFTs())
})

export default connect(mapToStateProps, mapToDispatchProps)(Hot);

