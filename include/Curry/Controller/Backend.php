<?php
/**
 * Curry CMS
 *
 * LICENSE
 *
 * This source file is subject to the GPL license that is bundled
 * with this package in the file LICENSE.txt.
 * It is also available through the world-wide-web at this URL:
 * http://currycms.com/license
 *
 * @category   Curry CMS
 * @package    Curry
 * @copyright  2011-2012 Bombayworks AB (http://bombayworks.se)
 * @license    http://currycms.com/license GPL
 * @link       http://currycms.com
 */

namespace Curry\Controller;
use Curry\App;
use Curry\Exception;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Event\GetResponseEvent;
use Symfony\Component\HttpKernel\KernelEvents;

/**
 * Main class for the backend.
 *
 * @package Curry\Controller\Backend
 */
class Backend extends \Curry\Backend\AbstractBackend implements EventSubscriberInterface {
	public function initialize()
	{
		$app = \Curry\App::getInstance();

		$cacheName = sha1(__CLASS__.'_backendClasses');
		$backendClasses = $app->cache->load($cacheName);
		if ($backendClasses === false) {
			$backendClasses = array();
			$classes = \Curry\Util\ClassEnumerator::findClasses(__DIR__.'/../Backend');
			foreach($classes as $className) {
				if (class_exists($className) && $className !== __CLASS__) {
					$r = new \ReflectionClass($className);
					if ($r->isSubclassOf('Curry\\Backend\\AbstractBackend') && !$r->isAbstract())
						$backendClasses[strtolower($r->getShortName())] = $className;
				}
			}
			$app->cache->save($backendClasses, $cacheName);
		}

		foreach($backendClasses as $viewName => $className) {
			$this->addView($viewName, new $className($this->app));
		}
	}

	public function url($parameters = null)
	{
		return '/admin/';
	}

	public static function getSubscribedEvents()
	{
		return array(
			KernelEvents::REQUEST => 'onKernelRequest',
		);
	}

	public function onKernelRequest(GetResponseEvent $event)
	{
		$request = $event->getRequest();
		if (preg_match('#^'.preg_quote($this->url(), '#').'(.*)$#', $request->getPathInfo(), $m)) {
			$view = $this->findView($m[1]);
			if ($view) {
				$request->attributes->set('_view', $view);
				$request->attributes->set('_controller', array($this, 'index'));
			}
		}

		if (preg_match('#^'.preg_quote('/shared/', '#').'(.*)$#', $request->getPathInfo(), $m)) {
			$file = $this->findSharedFile($m[1]);
			if ($file !== false) {
				$request->attributes->set('_file', $file);
				$request->attributes->set('_controller', array($this, 'showSharedFile'));
			}
		}
	}

	public function findSharedFile($path)
	{
		$app = App::getInstance();
		$base = realpath($app->config->curry->basePath.'/shared');
		if ($base) {
			$base .= '/';
			$target = realpath($base.$path);
			if ($target && substr($target, 0, strlen($base)) === $base
					&& substr($target, -strlen($path)) === $path) {
				return $target;
			}
		}
		return false;
	}

	public function showSharedFile()
	{
		$app = App::getInstance();
		$file = $app->request->attributes->get('_file');
		$response = new BinaryFileResponse($file);
		$extension = strtolower(pathinfo($file, PATHINFO_EXTENSION));
		$extensionToMime = array(
			'css' => 'text/css',
			'js' => 'application/javascript',
			'gif' => 'image/gif',
			'html' => 'text/html',
		);
		if (isset($extensionToMime[$extension]))
			$response->headers->set('Content-Type', $extensionToMime[$extension]);
		return $response;
	}

	public function index()
	{
		$app = App::getInstance();
		$view = $app->request->attributes->get('_view');
		$response = $view->show($app->request);
		if (!$response instanceof Response)
			$response = new Response(\Curry\Util\Helper::stringify($response));
		return $response;
	}

	public function show(Request $request)
	{
		foreach($this->views() as $name => $viewAndRoute) {
			list($view, $route) = $viewAndRoute;
			$this->addMainContent('<a href="'.$view->url().'">'.$name.'</a><br/>');
		}
		return $this->render();
	}
}
