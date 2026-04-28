import RouteMap from './RouteMap';

/**
 * General map component alias for screens that need the base route map.
 *
 * @param {object} props - RouteMap props.
 * @returns {JSX.Element}
 */
const MapView = (props) => <RouteMap {...props} />;

export default MapView;
