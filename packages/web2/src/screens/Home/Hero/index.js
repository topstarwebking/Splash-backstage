import cn from "classnames";
import { Link } from "react-router-dom";
import styles from "./Hero.module.sass";
import Card2 from "../../../components/Card2";

const item = {
    description: "You Only Live Once",
    name:"Jack London",
    cur_price: "0.1",
    coverData: "/images/content/book1.png"
  };

const Hero = () => {
  return (
    <>
      <div className={cn("section", styles.section)}>
        <div className={cn("container", styles.container)}>
          <div className={cn("wrapper", styles.wrapper)}>
            <div className={cn("intro", styles.intro)}>
              <h2 className={cn("h3", styles.title)}>
                Decentralizing Books
              </h2>
              <span className={styles.subtitle1}>
                Web3 is here, it's time to own your content.
              </span>
              <div className={cn("subtitle2", styles.subtitle2)}>
                <img src="/images/content/question.png" alt="Question" />
                <Link to="#"> <span className={cn("learn", styles.learn)}>Learn more about Odiggo</span></Link>
                </div>
            </div>
            <div className={cn("preview", styles.preview)}>
              <Card2 className={styles.card} item={item}/>
            </div>
          </div>
        </div>
      </div>
      <div className={cn("section", styles.section)}>
        <div className={cn("container", styles.container)}>
          <div className={cn("wrapper2", styles.wrapper2)}>
            <div className={cn("forbes", styles.forbes)}>
              <img src="/images/content/forbes.png" alt="Forbes" />
            </div>
            <div className={cn("yahoo", styles.yahoo)}>
              <img src="/images/content/yahoo.png" alt="Yahoo" />
            </div>
            <div className={cn("microsoft", styles.microsoft)}>
              <img src="/images/content/microsoft-logo.png" alt="Microsoft" />
            </div>
            <div className={cn("techcrunch", styles.techcrunch)}>
              <img src="/images/content/tech-crunch.png" alt="TechCrunch" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Hero;
