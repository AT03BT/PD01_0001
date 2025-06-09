using Microsoft.AspNetCore.Mvc;

namespace PD01_SE01_0001.Controllers
{
    public class StateChartsController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }

        public IActionResult Chart1()
        {
            return View();
        }

        public IActionResult Chart2()
        {
            return View();
        }

        public IActionResult Chart3()
        {
            return View();
        }
    }
}
