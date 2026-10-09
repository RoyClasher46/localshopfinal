import { Helmet } from "react-helmet-async";

const APP_NAME = "ShopLocal";

function PageMeta({ title }) {
  const fullTitle = title ? title : APP_NAME;

  return (
    <Helmet>
      <title>{fullTitle}</title>
    </Helmet>
  );
}

export default PageMeta;
