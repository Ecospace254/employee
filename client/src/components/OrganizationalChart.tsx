import { useCallback, useMemo, useState, useEffect } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Panel,
  NodeProps,
  MarkerType,
  ConnectionLineType,
  Position,
  Handle,
  EdgeProps,
  getBezierPath,
  getSmoothStepPath,
  useReactFlow,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronRight, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import orgData from '@/data/organizationData.json';

// Type for organization node
type OrgNode = {
  id: string;
  title: string;
  children?: OrgNode[];
};

// Custom node component - Large rounded containers with solid colors
function CustomNode({ data }: NodeProps) {
  const { label, isCollapsed, hasChildren, onToggle, level } = data;

  // Solid background colors based on hierarchy level
  const getNodeStyle = (level: number) => {
    switch (level) {
      case 0:
        return 'bg-purple-600 text-white border-purple-700';
      case 1:
        return 'bg-blue-600 text-white border-blue-700';
      case 2:
        return 'bg-emerald-600 text-white border-emerald-700';
      case 3:
        return 'bg-teal-600 text-white border-teal-700';
      default:
        return 'bg-slate-600 text-white border-slate-700';
    }
  };

  return (
    <>
      {/* Target handle (top) - where incoming edges connect */}
      <Handle
        type="target"
        position={Position.Top}
        style={{ background: '#555', width: 8, height: 8, border: '2px solid white' }}
      />
      
      {/* Target handle (left) - for team members with flat structure */}
      <Handle
        type="target"
        position={Position.Left}
        id="left"
        style={{ background: '#555', width: 8, height: 8, border: '2px solid white' }}
      />
      
      <div
        className={cn(
          'px-8 py-4 rounded-2xl border-2 transition-all duration-200 min-w-[280px] shadow-lg',
          getNodeStyle(level),
          'hover:shadow-xl hover:scale-105'
        )}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-1">
            <Users className="w-5 h-5 flex-shrink-0" />
            <div className="text-sm font-bold leading-tight">
              {label}
            </div>
          </div>
          {hasChildren && (
            <button
              className="h-7 w-7 p-0 hover:bg-white/20 rounded-lg flex items-center justify-center transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                onToggle();
              }}
            >
              {isCollapsed ? (
                <ChevronRight className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </button>
          )}
        </div>
      </div>
      
      {/* Source handle (bottom) - where outgoing edges start */}
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ background: '#555', width: 8, height: 8, border: '2px solid white' }}
      />
    </>
  );
}

const nodeTypes = {
  custom: CustomNode,
};

// Custom edge for hierarchical connections (for teams with multiple children)
function HierarchicalEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  data,
}: EdgeProps) {
  const edgeColor = style?.stroke || '#64748b';
  const strokeWidth = style?.strokeWidth || 2;
  
  // Check if this is a "team edge" (multiple siblings from same parent)
  const isTeamEdge = data?.isTeamEdge || false;
  const siblingIndex = data?.siblingIndex || 0;
  const totalSiblings = data?.totalSiblings || 1;
  
  if (isTeamEdge && totalSiblings > 1) {
    // Create the maze-like path:
    // 1. Go down from parent
    // 2. Turn left (create vertical trunk)
    // 3. Branch right to each child
    
    const trunkOffset = 60; // Distance to the left for the trunk line
    const downDistance = 40; // Initial drop from parent
    const branchLength = trunkOffset; // Length of horizontal branch to child
    
    // Calculate vertical trunk position based on all siblings
    const firstChildY = targetY - ((totalSiblings - 1) * 120) / 2;
    const currentChildY = firstChildY + (siblingIndex * 120);
    
    const trunkX = sourceX - trunkOffset;
    const trunkStartY = sourceY + downDistance;
    const trunkEndY = firstChildY + ((totalSiblings - 1) * 120);
    
    const pathSegments = [
      `M ${sourceX} ${sourceY}`, // Start at parent bottom
      `L ${sourceX} ${trunkStartY}`, // Go down
      `L ${trunkX} ${trunkStartY}`, // Go left to trunk
      `L ${trunkX} ${currentChildY}`, // Go along trunk to this child's level
      `L ${targetX} ${targetY}`, // Go right to child
    ];
    
    return (
      <g>
        <path
          id={id}
          className="react-flow__edge-path"
          d={pathSegments.join(' ')}
          style={{
            ...style,
            stroke: edgeColor,
            strokeWidth,
            fill: 'none',
          }}
        />
      </g>
    );
  }
  
  // Default: use smooth step for chains and single children
  const [edgePath] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <g>
      <path
        id={id}
        className="react-flow__edge-path"
        d={edgePath}
        style={style}
      />
    </g>
  );
}

const edgeTypes = {
  hierarchical: HierarchicalEdge,
};

// Convert hierarchy to React Flow nodes and edges - PROPER ORG CHART LAYOUT
function hierarchyToNodesAndEdges(
  data: OrgNode,
  collapsedNodes: Set<string>,
  level = 0,
  x = 600,
  y = 0,
  parentId?: string,
  siblingIndex = 0,
  totalSiblings = 1
): { nodes: Node[]; edges: Edge[]; maxY: number; maxX: number } {
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  
  const hasChildren = data.children && data.children.length > 0;
  const isCollapsed = collapsedNodes.has(data.id);

  // Create node with explicit handle positions
  nodes.push({
    id: data.id,
    type: 'custom',
    position: { x, y },
    sourcePosition: Position.Bottom,
    targetPosition: Position.Top,
    data: {
      label: data.title,
      isCollapsed,
      hasChildren,
      level,
      onToggle: () => {}, // Will be set later
    },
  });

  // Create edge from parent
  if (parentId) {
    const edgeColor = level === 1 ? '#2563eb' : level === 2 ? '#10b981' : level === 3 ? '#0d9488' : '#64748b';
    
    // For teams at level 3+ (Training/Sales reports), connect to LEFT side
    const isTeamMember = totalSiblings > 1 && level >= 3;
    
    edges.push({
      id: `${parentId}-${data.id}`,
      source: parentId,
      target: data.id,
      targetHandle: isTeamMember ? 'left' : undefined, // Only teams use left handle
      type: isTeamMember ? 'step' : 'smoothstep', // Step edges for teams, smooth for others
      animated: false,
      style: { 
        stroke: edgeColor, 
        strokeWidth: 2
      },
    });
  }

  let maxY = y;
  let maxX = x;

  // Process children if not collapsed
  if (hasChildren && !isCollapsed && data.children) {
    const children = data.children;
    
    // LEVEL 1 (Managing Director's direct reports) - ARRANGE HORIZONTALLY IN A ROW
    if (level === 1) {
      const horizontalSpacing = 500; // Increased space between managers for cleaner look
      const verticalSpacing = 180; // Space from MD to managers
      const totalWidth = (children.length - 1) * horizontalSpacing;
      const startX = x - totalWidth / 2; // Center under Managing Director
      const currentY = y + verticalSpacing;

      children.forEach((child: OrgNode, index: number) => {
        const childX = startX + index * horizontalSpacing;
        const result = hierarchyToNodesAndEdges(
          child,
          collapsedNodes,
          level + 1,
          childX,
          currentY,
          data.id,
          index,
          children.length
        );
        
        nodes.push(...result.nodes);
        edges.push(...result.edges);
        maxY = Math.max(maxY, result.maxY);
        maxX = Math.max(maxX, result.maxX, childX);
      });
    } 
    // LEVEL 2+ - Check if it's a CHAIN (single child) or TEAM (multiple children)
    else {
      const verticalSpacing = 140; // Increased space between nodes for cleaner look
      
      // If only ONE child, it's a CHAIN - keep same X (centered below parent)
      if (children.length === 1) {
        const childY = y + verticalSpacing;
        const result = hierarchyToNodesAndEdges(
          children[0],
          collapsedNodes,
          level + 1,
          x, // Same X as parent for chain
          childY,
          data.id,
          0,
          1
        );
        
        nodes.push(...result.nodes);
        edges.push(...result.edges);
        maxY = Math.max(maxY, result.maxY, childY);
        maxX = Math.max(maxX, result.maxX);
      } 
      // If MULTIPLE children, it's a TEAM - keep centered but use left connections
      else {
        let currentY = y + verticalSpacing;

        children.forEach((child: OrgNode, index: number) => {
          const childY = currentY + (index * verticalSpacing);
          
          const result = hierarchyToNodesAndEdges(
            child,
            collapsedNodes,
            level + 1,
            x, // Keep same X as parent (centered)
            childY,
            data.id,
            index,
            children.length
          );
          
          nodes.push(...result.nodes);
          edges.push(...result.edges);
          maxY = Math.max(maxY, result.maxY, childY);
          maxX = Math.max(maxX, result.maxX);
        });
      }
    }
  }

  return { nodes, edges, maxY: Math.max(maxY, y + 150), maxX };
}

export default function OrganizationalChart() {
  const [collapsedNodes, setCollapsedNodes] = useState<Set<string>>(new Set());

  // Log to verify component is loading
  console.log('OrganizationalChart v2.0 loaded - New professional design');

  // Generate nodes and edges
  const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
    const result = hierarchyToNodesAndEdges(orgData, collapsedNodes);
    
    // Debug logging
    console.log('=== ORG CHART DEBUG ===');
    console.log('Generated nodes:', result.nodes.length);
    console.log('Generated edges:', result.edges.length);
    console.log('First 3 edges:', result.edges.slice(0, 3));
    
    // Verify all edges have valid source and target nodes
    const nodeIds = new Set(result.nodes.map(n => n.id));
    const invalidEdges = result.edges.filter(e => !nodeIds.has(e.source) || !nodeIds.has(e.target));
    if (invalidEdges.length > 0) {
      console.error('Invalid edges found:', invalidEdges);
    }
    
    console.log('All node IDs:', Array.from(nodeIds));
    
    // Add toggle handlers
    result.nodes = result.nodes.map(node => ({
      ...node,
      data: {
        ...node.data,
        onToggle: () => {
          setCollapsedNodes(prev => {
            const newSet = new Set(prev);
            if (newSet.has(node.id)) {
              newSet.delete(node.id);
            } else {
              newSet.add(node.id);
            }
            return newSet;
          });
        },
      },
    }));

    console.log('Returning edges count:', result.edges.length);
    return result;
  }, [collapsedNodes]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Update nodes when collapsed state changes
  useMemo(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  const handleExpandAll = useCallback(() => {
    setCollapsedNodes(new Set());
  }, []);

  const handleCollapseAll = useCallback(() => {
    const allNodeIds = new Set(initialNodes.map(n => n.id));
    setCollapsedNodes(allNodeIds);
  }, [initialNodes]);

  return (
    <div className="w-full h-[300px]">
      {/* React Flow Chart - Clean, professional view */}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView={false}
        minZoom={0.1}
        maxZoom={2}
        defaultViewport={{ x: 50, y: 0, zoom: 0.5 }}
        attributionPosition="bottom-right"
        proOptions={{ hideAttribution: true }}
        panOnScroll={false}
        zoomOnScroll={true}
        zoomOnPinch={true}
        panOnDrag={true}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        connectionLineType={ConnectionLineType.SmoothStep}
        defaultEdgeOptions={{
          type: 'smoothstep',
          animated: false,
          style: { 
            strokeWidth: 2,
            stroke: '#64748b',
          },
        }}
        edgesUpdatable={false}
        edgesFocusable={false}
      >
        <Controls 
          position="bottom-right"
          showInteractive={false}
          className="bg-white/90 backdrop-blur-sm"
        />
      </ReactFlow>
    </div>
  );
}
