import PageMeta from "./PageMeta";

function MetaWrapper({ element, title }) {
  return (
    <>
      <PageMeta title={title} />
      {element}
    </>
  );
}

export default MetaWrapper;
