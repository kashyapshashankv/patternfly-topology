import { createRoot } from "react-dom/client";
import * as React from 'react';
import {Dropdown, DropdownItem, DropdownList, MenuToggle, MenuToggleElement, Split, SplitItem, ToolbarItem} from '@patternfly/react-core';
import {RegionsIcon as Icon1, FolderOpenIcon as Icon2} from '@patternfly/react-icons';
import {action,  onStatusDecoratorClick,createTopologyControlButtons,withContextMenu, WithContextMenuProps, ContextMenuSeparator, ContextMenuItem, defaultControlButtonsOptions, SELECTION_EVENT,EdgeStyle, TopologySideBar, DefaultEdge, DefaultGroup, DefaultNode, GraphComponent, GRAPH_LAYOUT_END_EVENT, ModelKind, NodeModel, NodeShape, observer, TopologyView, TopologyControlBar, Visualization, VisualizationProvider, VisualizationSurface, ComponentFactory, Model, Node, NodeStatus, Graph, Layout, LayoutFactory, ForceLayout, ColaLayout, ConcentricLayout, DagreLayout, GridLayout, BreadthFirstLayout, ColaGroupsLayout, withDragNode, WithDragNodeProps, withPanZoom,withSelection, WithSelectionProps} from '@patternfly/react-topology';

const NODE_DIAMETER = 75;
const NODE_SHAPE = NodeShape.ellipse;
const NODES = [{
  id: 'node-0',
  type: 'node',
  label: 'Node 0',
  width: NODE_DIAMETER,
  height: NODE_DIAMETER,
  shape: NODE_SHAPE,
  status: NodeStatus.danger,
  data: {
    badge: 'B',
    isAlternate: false
  }
}, {
  id: 'node-1',
  type: 'node',
  label: 'Node 1',
  width: NODE_DIAMETER,
  height: NODE_DIAMETER,
  shape: NODE_SHAPE,
  status: NodeStatus.success,
  data: {
    isAlternate: false
  }
}, {
  id: 'node-2',
  type: 'node',
  label: 'Node 2',
  width: NODE_DIAMETER,
  height: NODE_DIAMETER,
  shape: NODE_SHAPE,
  status: NodeStatus.warning,
  data: {
    isAlternate: true
  }
}, {
  id: 'node-3',
  type: 'node',
  label: 'Node 3',
  width: NODE_DIAMETER,
  height: NODE_DIAMETER,
  shape: NODE_SHAPE,
  status: NodeStatus.info,
  data: {
    isAlternate: false
  }
}, {
  id: 'node-4',
  type: 'node',
  label: 'Node 4',
  width: NODE_DIAMETER,
  height: NODE_DIAMETER,
  shape: NODE_SHAPE,
  status: NodeStatus.default,
  data: {
    isAlternate: true
  }
}, {
  id: 'node-5',
  type: 'node',
  label: 'Node 5',
  width: NODE_DIAMETER,
  height: NODE_DIAMETER,
  shape: NODE_SHAPE,
  data: {
    isAlternate: false
  }
}, {
  id: 'Group-1',
  children: ['node-0', 'node-1', 'node-2'],
  type: 'group',
  group: true,
  label: 'Group-1',
  style: {
    padding: 40
  }
}];
const EDGES = [{
  id: 'edge-node-4-node-5',
  type: 'edge',
  source: 'node-4',
  target: 'node-5'
}, {
  id: 'edge-node-0-node-2',
  type: 'edge',
  source: 'node-0',
  target: 'node-2'
}];

const BadgeColors = [
  {
    name: 'A',
    badgeColor: '#ace12e',
    badgeTextColor: '#0f280d',
    badgeBorderColor: '#486b00'
  },
  {
    name: 'B',
    badgeColor: '#F2F0FC',
    badgeTextColor: '#5752d1',
    badgeBorderColor: '#CBC1FF'
  }
];
const customLayoutFactory = (type, graph) => {
  switch (type) {
    case 'BreadthFirst':
      return new BreadthFirstLayout(graph);
    case 'Cola':
      return new ColaLayout(graph);
    case 'ColaNoForce':
      return new ColaLayout(graph, {
        layoutOnDrag: false
      });
    case 'Concentric':
      return new ConcentricLayout(graph);
    case 'Dagre':
      return new DagreLayout(graph);
    case 'Force':
      return new ForceLayout(graph);
    case 'Grid':
      return new GridLayout(graph);
    case 'ColaGroups':
      return new ColaGroupsLayout(graph, {
        layoutOnDrag: false
      });
    default:
      return new ColaLayout(graph, {
        layoutOnDrag: false
      });
  }
};

const CustomNode = observer(({element, onSelect, selected,onContextMenu, contextMenuOpen, ...rest}) => {
  const data = element.getData();
  const Icon = data.isAlternate ? Icon2 : Icon1;
  const badgeColors = BadgeColors.find(badgeColor => badgeColor.name === data.badge);
  return  <DefaultNode element={element} {...rest} onContextMenu={onContextMenu} contextMenuOpen={contextMenuOpen}  showStatusDecorator badge={data.badge} badgeColor={badgeColors?.badgeColor} badgeTextColor={badgeColors?.badgeTextColor} badgeBorderColor={badgeColors?.badgeBorderColor} onSelect={onSelect} selected={selected}>
  <g transform={`translate(25, 25)`}>
    <Icon style={{
color: '#393F44'
}} width={25} height={25} />
  </g>
</DefaultNode>;
});
const customComponentFactory = (kind, type) => {
  const contextMenuItem = (label, i) => {
    if (label === '-') {
      return <ContextMenuSeparator component="li" key={`separator:${i.toString()}`} />;
    }
    return <ContextMenuItem key={label} onClick={() => alert(`Selected: ${label}`)}>
        {label}
      </ContextMenuItem>;
  };
  const createContextMenuItems = (...labels) => labels.map(contextMenuItem);
  const contextMenu = createContextMenuItems('First', 'Second', 'Third', '-', 'Fourth');
  switch (type) {
    case 'group':
      return DefaultGroup;
    default:
      switch (kind) {
        case ModelKind.graph:
          return withPanZoom()(GraphComponent);
        case ModelKind.node:
          return withContextMenu(() => contextMenu)(withSelection()(withDragNode()(CustomNode)));
        case ModelKind.edge:
          return DefaultEdge;
        default:
          return undefined;
      }
  }
};
export const App = () => {
  const onStatusDecoratorClick =  React.useState(console.log('The link was clicked.'));
  const [selectedIds, setSelectedIds] = React.useState([]);
  const [layoutDropdownOpen, setLayoutDropdownOpen] = React.useState(false);
  const [layout, setLayout] = React.useState('Cola');
  const controller = React.useMemo(() => {
    const model = {
      nodes: NODES,
      edges: EDGES,
      graph: {
        id: 'g1',
        type: 'graph',
        layout: 'Cola'
      }
    };
    const newController = new Visualization();
    newController.registerLayoutFactory(customLayoutFactory);
    newController.registerComponentFactory(customComponentFactory);
    newController.addEventListener(GRAPH_LAYOUT_END_EVENT, () => {
      newController.getGraph().fit(80);
    });
    newController.addEventListener(SELECTION_EVENT, setSelectedIds);
    newController.fromModel(model, false);
    return newController;
  }, []);
  const updateLayout = newLayout => {
    setLayout(newLayout);
    setLayoutDropdownOpen(false);
  };
  React.useEffect(() => {
    if (controller && controller.getGraph().getLayout() !== layout) {
      const model = {
        nodes: NODES,
        edges: EDGES,
        graph: {
          id: 'g1',
          type: 'graph',
          layout
        }
      };
      controller.fromModel(model, false);
    }
  }, [controller, layout]);
  const layoutDropdown = <Split>
      <SplitItem>
        <label className="pf-v5-u-display-inline-block pf-v5-u-mr-md pf-v5-u-mt-sm">Layout</label>
      </SplitItem>
      <SplitItem>
        <Dropdown toggle={toggleRef => <MenuToggle ref={toggleRef} onClick={() => setLayoutDropdownOpen(!layoutDropdownOpen)}>
              {layout}
            </MenuToggle>} isOpen={layoutDropdownOpen}>
          <DropdownList>
            <DropdownItem key={1} onClick={() => {
    updateLayout('Force');
  }}>
              Force
            </DropdownItem>
            <DropdownItem key={2} onClick={() => {
    updateLayout('Dagre');
  }}>
              Dagre
            </DropdownItem>
            <DropdownItem key={3} onClick={() => {
    updateLayout('Cola');
  }}>
              Cola
            </DropdownItem>
            <DropdownItem key={8} onClick={() => {
    updateLayout('ColaGroups');
  }}>
              ColaGroups
            </DropdownItem>
            <DropdownItem key={4} onClick={() => updateLayout('ColaNoForce')}>
              ColaNoForce
            </DropdownItem>
            <DropdownItem key={5} onClick={() => updateLayout('Grid')}>
              Grid
            </DropdownItem>
            <DropdownItem key={6} onClick={() => updateLayout('Concentric')}>
              Concentric
            </DropdownItem>
            <DropdownItem key={7} onClick={() => updateLayout('BreadthFirst')}>
              BreadthFirst
            </DropdownItem>
          </DropdownList>
        </Dropdown>
      </SplitItem>
    </Split>;
  const topologySideBar = <TopologySideBar className="topology-example-sidebar" style={{height:'100%', width: '20%'}} show={selectedIds.length > 0} onClose={() => setSelectedIds([])}>
        <div style={{
      marginTop: 27,
      marginLeft: 20,
      height: '100%',
      }}>{selectedIds[0]}</div>
      </TopologySideBar>;
  return <TopologyView sideBar={topologySideBar}  controlBar={<TopologyControlBar controlButtons={createTopologyControlButtons({defaultControlButtonsOptions,
    zoomInCallback: action(() => {
      controller.getGraph().scaleBy(4 / 3);
    }),
    zoomOutCallback: action(() => {
      controller.getGraph().scaleBy(0.75);
    }),
    fitToScreenCallback: action(() => {
      controller.getGraph().fit(80);
    }),
    resetViewCallback: action(() => {
      controller.getGraph().reset();
      controller.getGraph().layout();
    }),
    legend: false
  })} />}>
      <VisualizationProvider controller={controller}>
        <VisualizationSurface state={{selectedIds}} />
      </VisualizationProvider>
    </TopologyView>;
};



const container = document.getElementById("root");
createRoot(container).render(<App />);


export default App;


// viewToolbar={<ToolbarItem>{layoutDropdown}</ToolbarItem>}
