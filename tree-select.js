(function (window) {
  let popupEl, popupHeader, popupBody, closeButton;
  let nodes = [];
  let sel = window.getSelection();
  let currentNode, nodeName;
  currentNode = sel.focusNode;
  if (!currentNode) {
    alert("Please select some text before running this bookmarklet");
    return;
  }
  let index = 0;

  function selectNodeContents(i) {
    console.log(nodes);
    console.log(i);
    if (i < nodes.length - 1 && i >= 0) {
      let targetNode = nodes[i].node.parentNode;
      if (targetNode.nodeName.toLowerCase() === "body") {
        sel.setBaseAndExtent(targetNode.firstChild, 0, popupEl, 0);
      } else {
        sel.selectAllChildren(targetNode);
      }
      return i;
    } else {
      return null;
    }
  }

  do {
    nodeName = currentNode.nodeName.toLowerCase();
    const nInfo = { element: nodeName, node: currentNode };
    nodes.push(nInfo);
    currentNode = currentNode.parentNode;
  } while (nodeName != "body");

  const props = {
    uniqueId:
      "z-" +
      Math.random().toString(36).slice(2) +
      "-" +
      Math.random().toString(36).slice(2),
    width: "30%",
    minWidth: "10em",
    background: "#333",
    color: "#fff",
    opacity: 0.85,
    borderThickness: 1,
    borderRadius: 0.4,
    headerHeight: 32,
    windowTitle: "",
  };

  const windowPosition = {
    left: ~~(document.documentElement.clientWidth / 2 - props.width / 2),
    top: ~~(document.documentElement.clientHeight / 2 - props.height / 2),
  };

  function buildPopup() {
    popupEl = document.createElement("div");
    popupEl.setAttribute("id", props.uniqueId);

    Object.assign(popupEl.style, {
      position: "fixed",
      left: windowPosition.left + "px",
      top: windowPosition.top + "px",
      zIndex: Number.MAX_SAFE_INTEGER,
      width: props.width,
      minWidth: props.minWidth,
      background: props.background,
      color: props.color,
      opacity: props.opacity,
      borderRadius: props.borderRadius + "em",
      border: props.borderThickness + "px solid " + props.color,
    });
    popupHeader = document.createElement("div");
    Object.assign(popupHeader.style, {
      padding: "0 .25em .25em 1em",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    });
    const popupHeaderTitle = document.createElement("div");
    Object.assign(popupHeaderTitle.style, {});
    popupHeaderTitle.textContent = props.windowTitle;
    closeButton = document.createElement("button");
    closeButton.setAttribute("id", props.uniqueId + "__close-button");

    popupBody = document.createElement("div");
    Object.assign(popupBody.style, {
      padding: ".25em 1em",
      display: "grid",
      rowGap: ".25em",
    });
    const p = document.createElement("p");
    p.textContent = "Choose node level for selection";
    popupBody.appendChild(p);
    const upButton = document.createElement("button");
    upButton.innerHTML = "Up";
    upButton.onclick = () => {
      index = selectNodeContents(index + 1) ?? index;
    };
    const downButton = document.createElement("button");
    downButton.innerHTML = "Down";
    downButton.onclick = () => {
      index = selectNodeContents(index - 1) ?? index;
    };
    popupBody.appendChild(upButton);
    popupBody.appendChild(downButton);
    closeButton.addEventListener("click", () => popupEl.remove(), false);
    closeButton.textContent = "×";
    popupHeader.appendChild(popupHeaderTitle);
    popupHeader.appendChild(closeButton);
    popupEl.appendChild(popupHeader);
    popupEl.appendChild(popupBody);
    document.body.appendChild(popupEl);
    document.querySelectorAll(`#${props.uniqueId} button`).forEach((b) =>
      Object.assign(b.style, {
        cursor: "pointer",
        background: "none",
        padding: ".25em",
        border: props.borderThickness + "px solid " + props.color,
        color: props.color,
        borderRadius: ".25em",
      })
    );
    Object.assign(closeButton.style, {
      aspectRatio: "1",
      color: props.color,
      textAlign: "center",
      padding: "0",
      border: "none",
    });
  }

  buildPopup();

  draggable(popupHeader);

  /* Source: https://plainjs.com/javascript/styles/get-the-position-of-an-element-relative-to-the-document-24/ */
  function offset(el) {
    const rect = el.getBoundingClientRect(),
      scrollLeft = window.pageXOffset || document.documentElement.scrollLeft,
      scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    return { top: rect.top + scrollTop, left: rect.left + scrollLeft };
  }
  /* Source: https://gist.github.com/remarkablemark/5002d27442600510d454a5aeba370579 */
  function draggable(el) {
    const initialOffset = offset(el.parentElement);
    let isMouseDown = false;
    const currPos = { x: 0, y: 0 };
    const elPos = { x: initialOffset.left, y: initialOffset.top };
    el.parentElement.addEventListener("mousedown", onMouseDown);
    function onMouseDown(event) {
      isMouseDown = true;
      currPos.x = event.clientX;
      currPos.y = event.clientY;
      el.parentElement.style.cursor = "move";
    }
    el.parentElement.addEventListener("mouseup", onMouseUp);
    function onMouseUp(event) {
      isMouseDown = false;
      elPos.x = parseInt(el.parentElement.style.left) || 0;
      elPos.y = parseInt(el.parentElement.style.top) || 0;
      el.parentElement.style.cursor = "auto";
    }
    document.addEventListener("mousemove", onMouseMove);
    function onMouseMove(event) {
      if (!isMouseDown) return;
      const delta = {
        x: event.clientX - currPos.x,
        y: event.clientY - currPos.y,
      };
      const pos = { x: elPos.x + delta.x, y: elPos.y + delta.y };
      if (pos.x < 0) {
        pos.x = 0;
      } else if (
        pos.x + el.parentElement.offsetWidth >
        document.documentElement.clientWidth
      ) {
        pos.x =
          document.documentElement.clientWidth - el.parentElement.offsetWidth;
      }
      if (pos.y < 0) {
        pos.y = 0;
      } else if (
        pos.y + el.parentElement.offsetHeight >
        document.documentElement.clientHeight
      ) {
        pos.y =
          document.documentElement.clientHeight - el.parentElement.offsetHeight;
      }
      el.parentElement.style.left = pos.x + "px";
      el.parentElement.style.top = pos.y + "px";
    }
  }
})(window);
