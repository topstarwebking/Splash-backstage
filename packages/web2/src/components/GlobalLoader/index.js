import { useMeta } from '@oyster/common';
import styles from "./GlobalLoader.module.sass";
import cn from "classnames";

export const LoaderProvider = ({ children }) => {
  const { isLoading } = useMeta();

  return (
    <>
      <div className={cn(styles.loadercontainer, { [styles.active]: isLoading })}>
        <div className={cn(styles.loaderblock)}>
          <div className={cn(styles.loadertitle)}>loading</div>
          <Spinner />
        </div>
      </div>
      {children}
    </>
  );
};

export const Spinner = () => {
  return (
    <div className={cn(styles.spinner)}>
      <span className={cn(styles.line, styles.line1)}/>
      <span className={cn(styles.line, styles.line2)}/>
      <span className={cn(styles.line, styles.line3)}/>
      <span className={cn(styles.line, styles.line4)}/>
      <span className={cn(styles.line, styles.line5)}/>
      <span className={cn(styles.line, styles.line6)}/>
      <span className={cn(styles.line, styles.line7)}/>
      <span className={cn(styles.line, styles.line8)}/>
      <span className={cn(styles.line, styles.line9)}/>
    </div>
  );
};
