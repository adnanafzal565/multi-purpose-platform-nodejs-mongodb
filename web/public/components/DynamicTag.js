function DynamicTag({ name, content, file, id, classes, alt, caption, styles }) {

    const Tag = name;

    const parseStyles = (styleString) => {
        return styleString.split(";").reduce((acc, style) => {
          const [key, value] = style.split(":").map(s => s.trim());
          if (key && value) {
            acc[camelCaseStyles(key)] = value;
          }
          return acc;
        }, {});
      };
      
    const camelCaseStyles = (str) => str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());

    return (
        <>
            { ["h1", "h2", "h3", "h4", "h5", "h6", "p"].includes(Tag) ? (
                <Tag style={ parseStyles(styles) }
                    id={ id }
                    className={ classes }>{ content }</Tag>
            ) : ["img", "video"].includes(Tag) && (
                <>
                    {Tag == "img" ? (
                        <img src={ file?.src || "" }
                            style={ parseStyles(styles) }
                            id={ id }
                            className={ classes }
                            alt={ alt }
                            caption={ caption } />
                    ) : Tag == "video" && (
                        <video src={ file?.src || "" }
                            style={ parseStyles(styles) }
                            id={ id }
                            className={ classes }
                            alt={ alt }
                            caption={ caption }
                            controls></video>
                    ) }
                </>
            ) }
        </>
    );
}