
      function takeName(str) {
        let result = /^[A-z-]+/du.exec(str);

        if (result == null) {
          return [null, str];
        }

        return [result[0], str.substring(result.indices[0][1])];
      }

      function takeClass(str) {
        let result = /^\.([A-z-]+)/du.exec(str);

        if (result == null) {
          return [null, str];
        }

        return [result[1], str.substring(result.indices[1][1])];
      }

      function takeId(str) {
        let result = /^#([A-z-]+)/du.exec(str);

        if (result == null) {
          return [null, str];
        }

        return [result[1], str.substring(result.indices[1][1])];
      }

      function parseOneOf(parsers, str) {
        for (let parser of parsers) {
          let [result, cont] = parser(str);
          if (result !== null) {
            return [result, cont, parser.name];
          }
        }
        return [null, str, null];
      }

      function parseAll(parsers, str) {
        let results = {}
        while (parsers.length > 0) {
            let parser = parsers.pop()
            let [result, cont] = parser(str)
            if (result !== null) {
                results[parser.name] = [result, cont]
            } else {
                parsers.push(parser)
            }
            str= cont
        }
        return results
      }

      function takeElement(str) {
        var [idName, str] = takeId(str)
        if (idName === null) {
            var [className, str] = takeClass(str)
            var [idName, str] = takeId(str)
        } else {
            var [className, str] = takeClass(str)
        }

        console.log(name, idName, className, str);
      }

      // function h(elDescriptor) {}

      function h(elDescriptor) {
        let classIdx = elDescriptor.indexOf(".");
        let idIdx = elDescriptor.indexOf("#");
        let elEndIdx;

        let elName;
        let idName;
        let className;
        if (classIdx == -1 && idIdx == -1) {
          elEndIdx = -1;
        } else if (classIdx == -1) {
          idName = elDescriptor.substring(idIdx + 1);
          elEndIdx = elDescriptor.length;
        } else if (idIdx == -1) {
          className = elDescriptor.substring(classIdx + 1);
          elEndIdx = classIdx;
        } else {
          if (idIdx < classIdx) {
            idName = elDescriptor.substring(idIdx + 1, classIdx);
            className = elDescriptor.substring(classIdx + 1);
          } else {
            idName = elDescriptor.substring(idIdx + 1);
            className = elDescriptor.substring(classIdx + 1, idIdx);
          }
          elEndIdx = Math.min(idIdx, classIdx);
        }

        elName = elDescriptor.substring(0, elEndIdx);

        console.log(
          `el: ${elEndIdx} el: ${elName} idName: ${idName} className: ${className}`
        );
        // let [elName, classPart] = elDescriptor.split("#")
        // let [idName, className] = classPart ? classPart.split(".") : [undefined]
        // console.log(elName, idName, className)
        // let el = document.createElement(elName)
      }
